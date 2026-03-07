import type { CardTemplate } from '../db/types';


export interface BestCardResult {
  category: string;
  cardName: string;
  issuer: string;
  multiplier: number;
  limit?: string;
  cardTemplateId: string;
}

export const STANDARD_CATEGORIES = [
  'Dining',
  'Groceries',
  'Online Groceries',
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

/**
 * Maps card-specific categories to our standard categories for comparison.
 * Returns an array of standard categories as some broad terms (like "Travel") 
 * map to multiple specific categories (Flights, Hotels, etc.)
 */
export function normalizeCategory(category: string): string[] {
  const cat = category.toLowerCase();
  const results: string[] = [];
  
  if (cat.includes('dining') || cat.includes('restaurant')) results.push('Dining');
  
  if (cat.includes('online') && (cat.includes('grocer') || cat.includes('supermarket'))) {
    results.push('Online Groceries');
  } else if (cat.includes('supermarket') || cat.includes('grocer')) {
    results.push('Groceries');
  }
  
  const isPortal = cat.includes('portal') || cat.includes('chase travel') || cat.includes('amex travel') || cat.includes('cap one travel') || cat.includes('citi travel') || cat.includes('prepaid');
  const isDirect = cat.includes('direct');

  // Specific Travel categories
  if (cat.includes('flight') || cat.includes('airline')) {
    if (isPortal || (!isPortal && !isDirect)) {
      if (!results.includes('Travel Portal')) results.push('Travel Portal');
    }
    if (isDirect || (!isPortal && !isDirect)) results.push('Flights');
  }
  if (cat.includes('hotel')) {
    if (isPortal || (!isPortal && !isDirect)) {
      if (!results.includes('Travel Portal')) results.push('Travel Portal');
    }
    if (isDirect || (!isPortal && !isDirect)) results.push('Hotels');
  }
  if (cat.includes('rental car')) {
    if (isPortal || (!isPortal && !isDirect)) {
      if (!results.includes('Travel Portal')) results.push('Travel Portal');
    }
    if (isDirect || (!isPortal && !isDirect)) results.push('Rental Cars');
  }
  
  // Broad Travel catch-all
  if (cat === 'travel' || cat === 'other travel' || (isPortal && !results.includes('Travel Portal')) || (isDirect && !results.some(r => r === 'Flights' || r === 'Hotels' || r === 'Rental Cars'))) {
    const pushPortal = isPortal || (!isPortal && !isDirect);
    const pushDirect = isDirect || (!isPortal && !isDirect);

    if (pushPortal) {
      if (!results.includes('Travel Portal')) results.push('Travel Portal');
    }
    if (pushDirect) {
      if (!results.includes('Flights')) results.push('Flights');
      if (!results.includes('Hotels')) results.push('Hotels');
      if (!results.includes('Rental Cars')) results.push('Rental Cars');
    }
  }
  
  if (cat.includes('transit') || cat.includes('rideshare') || cat.includes('lyft') || cat.includes('uber')) results.push('Transit & Rideshare');
  
  if (cat.includes('gas') || cat.includes('ev charging')) results.push('Gas');
  
  if (cat.includes('streaming') || cat.includes('entertainment') || cat.includes('apple') || cat.includes('disney')) results.push('Streaming');
  
  if (cat.includes('drugstore')) results.push('Drugstores');
  
  if (results.length === 0) results.push('Everything Else');
  
  return results;
}

/**
 * Calculates the best card for each standard category based on provided card templates.
 */
export function getBestCardPerCategory(templates: CardTemplate[]): BestCardResult[] {
  const resultsMap: Record<string, BestCardResult> = {};
  
  STANDARD_CATEGORIES.forEach(cat => {
    resultsMap[cat] = {
      category: cat,
      cardName: 'None',
      issuer: '',
      multiplier: 0,
      cardTemplateId: ''
    };
  });

  templates.forEach(template => {
    template.earningRates.forEach(rate => {
      const normalizedCategories = normalizeCategory(rate.category);
      
      normalizedCategories.forEach(normalized => {
        if (resultsMap[normalized]) {
          if (rate.multiplier > resultsMap[normalized].multiplier) {
            resultsMap[normalized] = {
              category: normalized,
              cardName: template.name,
              issuer: template.issuer,
              multiplier: rate.multiplier,
              limit: rate.limit,
              cardTemplateId: template.id
            };
          }
        }
      });
      
      // Special case: Custom Cash types that have a "Top Category"
      if (rate.category.includes('Top Category')) {
        const potentialCats = ['Dining', 'Groceries', 'Flights', 'Hotels', 'Rental Cars', 'Transit & Rideshare', 'Gas', 'Streaming', 'Drugstores'];
        potentialCats.forEach(catName => {
          if (rate.multiplier > resultsMap[catName].multiplier) {
            resultsMap[catName] = {
              category: catName,
              cardName: template.name,
              issuer: template.issuer,
              multiplier: rate.multiplier,
              limit: rate.limit,
              cardTemplateId: template.id
            };
          }
        });
      }
    });

    // Fallback for "Everything Else"
    const catchAll = template.earningRates.find(r => 
      r.category.toLowerCase().includes('all other') || 
      r.category.toLowerCase().includes('everything') ||
      r.category.toLowerCase() === 'all'
    );
    
    if (catchAll && catchAll.multiplier > resultsMap['Everything Else'].multiplier) {
      resultsMap['Everything Else'] = {
        category: 'Everything Else',
        cardName: template.name,
        issuer: template.issuer,
        multiplier: catchAll.multiplier,
        limit: catchAll.limit,
        cardTemplateId: template.id
      };
    }
  });

  return STANDARD_CATEGORIES.map(cat => resultsMap[cat]);
}
