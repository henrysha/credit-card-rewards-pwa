import type { CardTemplate } from '../db/types';


export interface BestCardResult {
  category: string;
  cardName: string;
  issuer: string;
  multiplier: number;
  limit?: string;
  cardTemplateId: string;
  subCategories?: BestCardResult[];
}

export const STANDARD_CATEGORIES = [
  'Dining',
  'Groceries',
  'Online Groceries',
  'Online Shopping',
  'Travel Portal',
  'Flights',
  'Hotels',
  'Rental Cars',
  'Transit & Rideshare',
  'Gas',
  'Streaming',
  'Drugstores',
  'Everything Else'
];

interface VendorMap {
  broad: string;
  vendor: string;
  keywords: string[];
}

const VENDOR_RULES: VendorMap[] = [
  { broad: 'Dining', vendor: 'Panera', keywords: ['panera'] },
  { broad: 'Dining', vendor: 'Uber Eats', keywords: ['uber eats'] },
  { broad: 'Groceries', vendor: 'Whole Foods', keywords: ['whole foods'] },
  { broad: 'Groceries', vendor: 'Amazon Fresh', keywords: ['amazon fresh'] },
  { broad: 'Online Shopping', vendor: 'Amazon.com', keywords: ['amazon.com'] },
  { broad: 'Online Shopping', vendor: 'Apple', keywords: ['apple'] },
  { broad: 'Online Shopping', vendor: 'Nike', keywords: ['nike'] },
  { broad: 'Online Shopping', vendor: 'Ace Hardware', keywords: ['ace hardware'] },
  { broad: 'Gas', vendor: 'Exxon', keywords: ['exxon'] },
  { broad: 'Transit & Rideshare', vendor: 'Lyft', keywords: ['lyft'] },
  { broad: 'Drugstores', vendor: 'Walgreens', keywords: ['walgreens'] },
];

export interface ParsedCategories {
  broad: string[];
  vendors: { broad: string, vendor: string }[];
}

export function normalizeCategory(category: string): ParsedCategories {
  const cat = category.toLowerCase();
  const broad: string[] = [];
  const vendors: { broad: string, vendor: string }[] = [];

  // DINING
  if (cat.includes('dining') || (cat.includes('restaurant') && !cat.includes('panera'))) {
    broad.push('Dining');
  }
  
  // GROCERIES
  if (cat.includes('online') && (cat.includes('grocer') || cat.includes('supermarket'))) {
    broad.push('Online Groceries');
  } else if ((cat.includes('supermarket') || cat.includes('grocer')) && !cat.includes('amazon fresh')) {
    broad.push('Groceries');
  }

  // TRAVEL
  const isPortal = cat.includes('portal') || cat.includes('chase travel') || cat.includes('amex travel') || cat.includes('cap one travel') || cat.includes('citi travel') || cat.includes('prepaid');
  const isDirect = cat.includes('direct');

  if (cat.includes('flight') || cat.includes('airline')) {
    if (isPortal || (!isPortal && !isDirect)) broad.push('Travel Portal');
    if (isDirect || (!isPortal && !isDirect)) broad.push('Flights');
  }
  if (cat.includes('hotel')) {
    if (isPortal || (!isPortal && !isDirect)) broad.push('Travel Portal');
    if (isDirect || (!isPortal && !isDirect)) broad.push('Hotels');
  }
  if (cat.includes('rental car')) {
    if (isPortal || (!isPortal && !isDirect)) broad.push('Travel Portal');
    if (isDirect || (!isPortal && !isDirect)) broad.push('Rental Cars');
  }
  
  if (cat === 'travel' || cat === 'other travel' || (isPortal && !broad.includes('Travel Portal')) || (isDirect && !broad.some(r => r === 'Flights' || r === 'Hotels' || r === 'Rental Cars'))) {
    const pushPortal = isPortal || (!isPortal && !isDirect);
    const pushDirect = isDirect || (!isPortal && !isDirect);
    if (pushPortal && !broad.includes('Travel Portal')) broad.push('Travel Portal');
    if (pushDirect) {
      if (!broad.includes('Flights')) broad.push('Flights');
      if (!broad.includes('Hotels')) broad.push('Hotels');
      if (!broad.includes('Rental Cars')) broad.push('Rental Cars');
    }
  }

  if (cat.includes('transit') || cat.includes('rideshare') || cat.includes('local transit')) {
    broad.push('Transit & Rideshare');
  }

  if (cat.includes('gas') || cat.includes('ev charging')) {
    broad.push('Gas');
  }

  if (cat.includes('streaming') || cat.includes('entertainment') || cat.includes('disney')) {
    broad.push('Streaming');
  }

  if (cat.includes('drugstore') || cat.includes('cvs')) {
    broad.push('Drugstores');
  }

  if (cat.includes('online shopping')) {
    broad.push('Online Shopping');
  }

  // VENDOR SPECIFIC
  VENDOR_RULES.forEach(rule => {
    if (rule.keywords.some(kw => cat.includes(kw))) {
      vendors.push({ broad: rule.broad, vendor: rule.vendor });
    }
  });

  if (cat.includes('uber') && !cat.includes('uber eats') && !vendors.some(v => v.vendor === 'Uber')) {
      vendors.push({ broad: 'Transit & Rideshare', vendor: 'Uber' });
  } else if (cat.match(/\buber\s*\//)) { 
      vendors.push({ broad: 'Transit & Rideshare', vendor: 'Uber' });
  }

  const uniqueBroad = Array.from(new Set(broad));
  if (uniqueBroad.length === 0 && vendors.length === 0) {
    uniqueBroad.push('Everything Else');
  }

  return { broad: uniqueBroad, vendors };
}

class CategoryTracker {
  bestCard: BestCardResult | null = null;
  
  update(rate: { multiplier: number, limit?: string }, template: CardTemplate) {
    if (!this.bestCard || rate.multiplier > this.bestCard.multiplier) {
        this.bestCard = {
            category: '', // filled in later
            cardName: template.name,
            issuer: template.issuer,
            multiplier: rate.multiplier,
            limit: rate.limit,
            cardTemplateId: template.id
        };
    }
  }
}

export function getBestCardPerCategory(templates: CardTemplate[]): BestCardResult[] {
  const broadTrackers: Record<string, CategoryTracker> = {};
  STANDARD_CATEGORIES.forEach(c => broadTrackers[c] = new CategoryTracker());
  
  const vendorTrackers: Record<string, Record<string, CategoryTracker>> = {};
  VENDOR_RULES.forEach(r => {
    if (!vendorTrackers[r.broad]) vendorTrackers[r.broad] = {};
    vendorTrackers[r.broad][r.vendor] = new CategoryTracker();
  });
  if (!vendorTrackers['Transit & Rideshare']) vendorTrackers['Transit & Rideshare'] = {};
  vendorTrackers['Transit & Rideshare']['Uber'] = new CategoryTracker();

  templates.forEach(template => {
    template.earningRates.forEach(rate => {
      const parsed = normalizeCategory(rate.category);
      
      parsed.broad.forEach(b => {
         if (broadTrackers[b]) broadTrackers[b].update(rate, template);
         // Apply to all vendors in this broad category
         if (vendorTrackers[b]) {
             Object.values(vendorTrackers[b]).forEach(vt => vt.update(rate, template));
         }
      });
      
      parsed.vendors.forEach(v => {
         if (vendorTrackers[v.broad] && vendorTrackers[v.broad][v.vendor]) {
             vendorTrackers[v.broad][v.vendor].update(rate, template);
         }
      });

      if (rate.category.includes('Top Category')) {
         const potentialCats = ['Dining', 'Groceries', 'Flights', 'Hotels', 'Rental Cars', 'Transit & Rideshare', 'Gas', 'Streaming', 'Drugstores'];
         potentialCats.forEach(b => {
             if (broadTrackers[b]) broadTrackers[b].update(rate, template);
             if (vendorTrackers[b]) {
                 Object.values(vendorTrackers[b]).forEach(vt => vt.update(rate, template));
             }
         });
      }
    });

    const catchAll = template.earningRates.find(r => 
      r.category.toLowerCase().includes('all other') || 
      r.category.toLowerCase().includes('everything') ||
      r.category.toLowerCase() === 'all'
    );
    if (catchAll) {
       broadTrackers['Everything Else'].update(catchAll, template);
       Object.values(broadTrackers).forEach(bt => bt.update(catchAll, template));
       Object.values(vendorTrackers).forEach(vGroup => {
           Object.values(vGroup).forEach(vt => vt.update(catchAll, template));
       });
    }
  });

  const finalResults: BestCardResult[] = [];
  STANDARD_CATEGORIES.forEach(cat => {
      const tracker = broadTrackers[cat];
      const result = tracker.bestCard || {
          category: cat, cardName: 'None', issuer: '', multiplier: 0, cardTemplateId: ''
      };
      result.category = cat;
      result.subCategories = [];
      
      if (vendorTrackers[cat]) {
          Object.entries(vendorTrackers[cat]).forEach(([vendorName, vt]) => {
              const vResult = vt.bestCard;
              if (vResult && vResult.multiplier > 0) {
                  // Only show subcategory if it has a larger multiplier than the broad category!
                  if (vResult.multiplier > result.multiplier) {
                      vResult.category = vendorName;
                      result.subCategories!.push(vResult as BestCardResult);
                  }
              }
          });
          result.subCategories.sort((a, b) => a.category.localeCompare(b.category));
      }
      
      finalResults.push(result);
  });

  return finalResults;
}
