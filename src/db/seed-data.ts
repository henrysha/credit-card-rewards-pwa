import type { CardTemplate, ChurningRule } from './types';

// ============================================================
// Complete Card Catalog — 14 Cards
// ============================================================

export const cardTemplates: CardTemplate[] = [
  // ─── CHASE ─────────────────────────────────────────────────
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    annualFee: 95,
    color: '#1a3c6e',
    signupBonus: { points: 75000, spend: 5000, timeMonths: 3, unit: 'points' },
    earningRates: [
      { category: 'Chase Travel', multiplier: 5 },
      { category: 'Dining', multiplier: 3 },
      { category: 'Streaming', multiplier: 3 },
      { category: 'Online Groceries', multiplier: 3 },
      { category: 'Other Travel', multiplier: 2 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'csp-hotel-credit', name: '$50 Hotel Credit', description: 'Annual hotel credit for stays booked through Chase Travel', category: 'hotel-credit', annualValue: 50, renewalPeriod: 'annual' },
      { id: 'csp-anniversary-bonus', name: '10% Anniversary Points Bonus', description: '10% bonus on points earned in previous year, awarded on account anniversary', category: 'other', annualValue: 0, renewalPeriod: 'annual' },
      { id: 'csp-dashpass', name: 'DashPass Membership', description: 'Complimentary DashPass membership for DoorDash (through 12/31/2027)', category: 'membership', annualValue: 120, renewalPeriod: 'annual', expirationDate: '2027-12-31' },
      { id: 'csp-doordash-credit', name: '$10 DoorDash Credit', description: 'Monthly $10 promo credit for grocery, convenience, or other non-restaurant orders (through 12/31/2027)', category: 'delivery-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, expirationDate: '2027-12-31' },
      { id: 'csp-trip-insurance', name: 'Trip Cancellation Insurance', description: 'Coverage for pre-paid, non-refundable travel expenses', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'csp-rental-insurance', name: 'Primary Rental Car Insurance', description: 'Primary coverage for rental car theft and collision damage', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'csp-lost-luggage', name: 'Lost Luggage Insurance', description: 'Coverage for lost, damaged, or stolen luggage', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    annualFee: 795,
    color: '#1a3c6e',
    signupBonus: { points: 125000, spend: 6000, timeMonths: 3, unit: 'points' },
    earningRates: [
      { category: 'Chase Travel', multiplier: 8 },
      { category: 'Flights & Hotels (direct)', multiplier: 4 },
      { category: 'Dining', multiplier: 3 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'csr-travel-credit', name: '$300 Travel Credit', description: 'Annual statement credit for travel purchases', category: 'travel-credit', annualValue: 300, renewalPeriod: 'annual' },
      { id: 'csr-edit-hotel', name: '$500 "The Edit" Hotel Credit', description: 'Annual credit for prepaid bookings at The Edit hotels ($250 biannual, 2-night min)', category: 'hotel-credit', annualValue: 500, renewalPeriod: 'semi-annual', periodValue: 250 },
      { id: 'csr-select-hotel', name: '$250 Select Hotel Credit', description: 'Annual credit for Chase Travel hotel bookings at IHG, Montage, Pendry, Omni, Virgin, etc. (starting 2026, 2-night min)', category: 'hotel-credit', annualValue: 250, renewalPeriod: 'annual' },
      { id: 'csr-dining', name: '$300 Exclusive Tables Dining', description: 'Annual dining credit at Sapphire Reserve Exclusive Tables restaurants ($150 biannual)', category: 'dining-credit', annualValue: 300, renewalPeriod: 'semi-annual', periodValue: 150 },
      { id: 'csr-stubhub', name: '$300 StubHub/Viagogo Credit', description: 'Annual ticket credit ($150 biannual, through 12/31/2027)', category: 'entertainment-credit', annualValue: 300, renewalPeriod: 'semi-annual', periodValue: 150, expirationDate: '2027-12-31', requiresEnrollment: true },
      { id: 'csr-lyft', name: '$120 Lyft Credit', description: '$10/month Lyft credit + 5x points on Lyft rides (through 9/30/2027)', category: 'rideshare-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, expirationDate: '2027-09-30', requiresEnrollment: true },
      { id: 'csr-restaurant-doordash', name: '$5 DoorDash Restaurant Credit', description: 'Monthly $5 restaurant promo credit (through 12/31/2027)', category: 'delivery-credit', annualValue: 60, renewalPeriod: 'monthly', periodValue: 5, expirationDate: '2027-12-31' },
      { id: 'csr-grocery-doordash-1', name: '$10 DoorDash Grocery Credit (1)', description: 'Monthly $10 grocery/retail promo credit (through 12/31/2027)', category: 'delivery-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, expirationDate: '2027-12-31' },
      { id: 'csr-grocery-doordash-2', name: '$10 DoorDash Grocery Credit (2)', description: 'Monthly $10 grocery/retail promo credit (through 12/31/2027)', category: 'delivery-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, expirationDate: '2027-12-31' },
      { id: 'csr-dashpass', name: 'DashPass Membership', description: 'Complimentary DashPass ($0 delivery fees, through 12/31/2027)', category: 'membership', annualValue: 120, renewalPeriod: 'annual', expirationDate: '2027-12-31' },
      { id: 'csr-apple', name: 'Apple TV+ & Apple Music', description: 'Complimentary subscriptions (through 6/22/2027)', category: 'streaming-credit', annualValue: 288, renewalPeriod: 'annual', expirationDate: '2027-06-22', requiresEnrollment: true },
      { id: 'csr-peloton', name: '$120 Peloton Credit', description: '$10/month toward Peloton memberships + 10x on equipment >$150 (through 12/31/2027)', category: 'wellness-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, expirationDate: '2027-12-31', requiresEnrollment: true },
      { id: 'csr-ge-tsa', name: '$120 Global Entry/TSA PreCheck', description: 'Statement credit for GE/TSA/NEXUS application fee every 4 years', category: 'global-entry-tsa', annualValue: 30, renewalPeriod: 'every-4-years' },
      { id: 'csr-lounge', name: 'Airport Lounge Access', description: 'Priority Pass Select + Chase Sapphire Lounges + select Air Canada lounges', category: 'lounge-access', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'csr-ihg', name: 'IHG Platinum Elite Status', description: 'Complimentary IHG One Rewards Platinum Elite (through 12/31/2027)', category: 'elite-status', annualValue: 0, renewalPeriod: 'annual', expirationDate: '2027-12-31' },
      { id: 'csr-trip-insurance', name: 'Travel Insurance Suite', description: 'Primary rental car, trip cancellation/delay, lost luggage, baggage delay, roadside assistance', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    annualFee: 0,
    color: '#1a3c6e',
    signupBonus: { points: 20000, spend: 500, timeMonths: 3, unit: 'cash back ($200)' },
    earningRates: [
      { category: 'Chase Travel', multiplier: 5 },
      { category: 'Dining', multiplier: 3 },
      { category: 'Drugstores', multiplier: 3 },
      { category: 'All Other', multiplier: 1.5 },
    ],
    perks: [
      { id: 'cfu-dashpass', name: 'DashPass 6-Month Trial', description: 'Complimentary 6-month DashPass membership', category: 'membership', annualValue: 60, renewalPeriod: 'one-time' },
      { id: 'cfu-purchase-protection', name: 'Purchase Protection', description: 'Covers new purchases against damage/theft for 120 days, up to $500/item', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cfu-extended-warranty', name: 'Extended Warranty', description: 'Adds 1 year to eligible manufacturer warranties (3yr or less)', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cfu-trip-insurance', name: 'Trip Cancellation Insurance', description: 'Up to $1,500/traveler, $6,000/trip', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cfu-rental', name: 'Auto Rental Coverage', description: 'Secondary insurance for rental car theft and collision damage', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
  {
    id: 'chase-ink-cash',
    name: 'Chase Ink Business Cash',
    issuer: 'Chase',
    annualFee: 0,
    color: '#1a3c6e',
    isBusinessCard: true,
    signupBonus: { points: 75000, spend: 6000, timeMonths: 3, unit: 'cash back ($750)' },
    earningRates: [
      { category: 'Office Supplies / Internet / Cable / Phone', multiplier: 5, limit: 'First $25K/yr' },
      { category: 'Gas Stations & Restaurants', multiplier: 2, limit: 'First $25K/yr' },
      { category: 'Lyft', multiplier: 5, limit: 'Through 9/30/2027' },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'cic-purchase-protection', name: 'Purchase Protection', description: 'Covers new purchases for 120 days, up to $10K/claim', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cic-extended-warranty', name: 'Extended Warranty', description: 'Adds 1 year to eligible warranties', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cic-rental', name: 'Primary Auto Rental (Business)', description: 'Primary coverage for rental cars used for business', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cic-instacart', name: '$20 Instacart Credit', description: '$20/month Instacart credit + 3-mo Instacart+ (through 12/31/2027)', category: 'delivery-credit', annualValue: 240, renewalPeriod: 'monthly', periodValue: 20, expirationDate: '2027-12-31', requiresEnrollment: true },
    ],
  },
  {
    id: 'chase-ink-preferred',
    name: 'Chase Ink Business Preferred',
    issuer: 'Chase',
    annualFee: 95,
    color: '#1a3c6e',
    isBusinessCard: true,
    signupBonus: { points: 100000, spend: 8000, timeMonths: 3, unit: 'points' },
    earningRates: [
      { category: 'Travel / Shipping / Ads / Internet / Cable / Phone', multiplier: 3, limit: 'First $150K/yr' },
      { category: 'Lyft', multiplier: 5, limit: 'Through 9/30/2027' },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'cip-cell-protection', name: 'Cell Phone Protection', description: 'Up to $1,000/claim ($100 deductible, 3 claims/12mo) when paying cell bill with card', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cip-rental', name: 'Primary Auto Rental (Business)', description: 'Primary coverage for business rental cars', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cip-trip-insurance', name: 'Travel Insurance Suite', description: 'Trip cancellation/delay, lost luggage, baggage delay', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cip-purchase-protection', name: 'Purchase Protection', description: 'Covers purchases for 120 days, up to $10K/claim', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'cip-extended-warranty', name: 'Extended Warranty', description: 'Adds 1 year to eligible warranties', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },

  // ─── AMEX ──────────────────────────────────────────────────
  {
    id: 'amex-gold',
    name: 'American Express Gold',
    issuer: 'Amex',
    annualFee: 325,
    color: '#c8a951',
    signupBonus: { points: 60000, spend: 6000, timeMonths: 6, unit: 'points' },
    earningRates: [
      { category: 'Restaurants Worldwide', multiplier: 4, limit: '$50K/yr' },
      { category: 'U.S. Supermarkets', multiplier: 4, limit: '$25K/yr' },
      { category: 'Flights (direct/Amex Travel)', multiplier: 3 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'ag-dining', name: '$120 Dining Credits', description: '$10/month at Grubhub, Cheesecake Factory, Goldbelly, Wine.com, Five Guys', category: 'dining-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, requiresEnrollment: true },
      { id: 'ag-uber', name: '$120 Uber Cash', description: '$10/month for Uber rides or Uber Eats (expires monthly)', category: 'rideshare-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10 },
      { id: 'ag-resy', name: '$100 Resy Credit', description: '$50 semi-annual credit for dining at U.S. Resy restaurants', category: 'dining-credit', annualValue: 100, renewalPeriod: 'semi-annual', periodValue: 50, requiresEnrollment: true },
      { id: 'ag-dunkin', name: '$84 Dunkin\' Credit', description: '$7/month at U.S. Dunkin\' locations', category: 'dining-credit', annualValue: 84, renewalPeriod: 'monthly', periodValue: 7, requiresEnrollment: true },
      { id: 'ag-hotel-collection', name: '$100 Hotel Collection Credit', description: '$100 credit for 2+ night stay booked through The Hotel Collection', category: 'hotel-credit', annualValue: 100, renewalPeriod: 'annual' },
    ],
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum',
    issuer: 'Amex',
    annualFee: 895,
    color: '#e5e4e2',
    signupBonus: { points: 175000, spend: 12000, timeMonths: 6, unit: 'points' },
    earningRates: [
      { category: 'Flights (direct/Amex Travel)', multiplier: 5 },
      { category: 'Prepaid Hotels (Amex Travel)', multiplier: 5 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'ap-hotel', name: '$600 Hotel Credit', description: '$300 semi-annual for FHR or Hotel Collection prepaid bookings through Amex Travel', category: 'hotel-credit', annualValue: 600, renewalPeriod: 'semi-annual', periodValue: 300 },
      { id: 'ap-airline', name: '$200 Airline Fee Credit', description: 'Annual credit for incidental fees with one selected airline', category: 'travel-credit', annualValue: 200, renewalPeriod: 'annual' },
      { id: 'ap-uber', name: '$200 Uber Cash', description: '$15/month + $20 December bonus for rides and Uber Eats', category: 'rideshare-credit', annualValue: 200, renewalPeriod: 'monthly', periodValue: 15 },
      { id: 'ap-uber-one', name: '$120 Uber One Credit', description: 'Annual credit for Uber One membership', category: 'membership', annualValue: 120, renewalPeriod: 'annual' },
      { id: 'ap-resy', name: '$400 Resy Credit', description: '$100/quarter for dining at U.S. Resy restaurants', category: 'dining-credit', annualValue: 400, renewalPeriod: 'quarterly', periodValue: 100, requiresEnrollment: true },
      { id: 'ap-entertainment', name: '$300 Digital Entertainment', description: '$25/month for Disney+, Hulu, Peacock, NYT, WSJ, YouTube Premium, etc.', category: 'streaming-credit', annualValue: 300, renewalPeriod: 'monthly', periodValue: 25, requiresEnrollment: true },
      { id: 'ap-saks', name: '$100 Saks Fifth Avenue', description: '$50 semi-annual credit at Saks Fifth Avenue or saks.com', category: 'shopping-credit', annualValue: 100, renewalPeriod: 'semi-annual', periodValue: 50, requiresEnrollment: true },
      { id: 'ap-walmart', name: '~$155 Walmart+ Membership', description: 'Monthly credit for Walmart+ membership (~$12.95/mo)', category: 'membership', annualValue: 155, renewalPeriod: 'monthly', periodValue: 12.95, requiresEnrollment: true },
      { id: 'ap-equinox', name: '$300 Equinox Credit', description: 'Annual credit for Equinox gym membership or Equinox+ digital', category: 'wellness-credit', annualValue: 300, renewalPeriod: 'annual', requiresEnrollment: true },
      { id: 'ap-lululemon', name: '$300 Lululemon Credit', description: '$75/quarter at U.S. lululemon stores and lululemon.com', category: 'shopping-credit', annualValue: 300, renewalPeriod: 'quarterly', periodValue: 75, requiresEnrollment: true },
      { id: 'ap-oura', name: '$200 Oura Ring Credit', description: 'Annual credit for Oura Ring hardware purchase', category: 'wellness-credit', annualValue: 200, renewalPeriod: 'annual' },
      { id: 'ap-clear', name: '$209 CLEAR+ Credit', description: 'Annual credit for CLEAR+ membership', category: 'membership', annualValue: 209, renewalPeriod: 'annual' },
      { id: 'ap-ge-tsa', name: '$100 Global Entry/TSA PreCheck', description: 'Credit for GE/TSA application fee every 4 years', category: 'global-entry-tsa', annualValue: 25, renewalPeriod: 'every-4-years' },
      { id: 'ap-lounge', name: 'Airport Lounge Access', description: 'Centurion Lounges, Delta Sky Club (10 visits), Priority Pass Select', category: 'lounge-access', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },

  // ─── AMEX DELTA ────────────────────────────────────────────
  {
    id: 'amex-delta-gold',
    name: 'Delta SkyMiles Gold Amex',
    issuer: 'Amex',
    annualFee: 150,
    firstYearFeeWaived: true,
    color: '#003a70',
    signupBonus: {
      points: 70000, spend: 3000, timeMonths: 6, unit: 'miles',
      additionalBonus: { points: 20000, spend: 2000, description: 'Additional 20K miles after $2K more spend' },
    },
    earningRates: [
      { category: 'Delta Purchases', multiplier: 2 },
      { category: 'Restaurants', multiplier: 2 },
      { category: 'U.S. Supermarkets', multiplier: 2 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'adg-checked-bag', name: 'First Checked Bag Free', description: 'Free first checked bag for you + up to 8 companions on same reservation', category: 'travel-credit', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adg-boarding', name: 'Zone 5 Priority Boarding', description: 'Priority boarding on Delta flights', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adg-inflight', name: '20% Back on Delta In-Flight', description: '20% statement credit on eligible Delta in-flight food & beverage purchases', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adg-award-discount', name: '15% Off Award Travel', description: '15% off when using miles for Delta award flights', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adg-delta-stays', name: '$100 Delta Stays Credit', description: 'Annual credit for prepaid hotels/vacation rentals on Delta Stays', category: 'hotel-credit', annualValue: 100, renewalPeriod: 'annual' },
      { id: 'adg-flight-credit', name: '$200 Delta Flight Credit', description: '$200 Delta Flight Credit after spending $10K on card in a calendar year', category: 'travel-credit', annualValue: 200, renewalPeriod: 'annual' },
      { id: 'adg-uber-one', name: '~6-mo Uber One Credit', description: 'Up to $9.99/mo for 6 consecutive months for Uber One membership (through 6/25/2026)', category: 'membership', annualValue: 60, renewalPeriod: 'one-time', expirationDate: '2026-06-25' },
    ],
  },
  {
    id: 'amex-delta-platinum',
    name: 'Delta SkyMiles Platinum Amex',
    issuer: 'Amex',
    annualFee: 350,
    color: '#003a70',
    signupBonus: {
      points: 80000, spend: 4000, timeMonths: 6, unit: 'miles',
      additionalBonus: { points: 20000, spend: 2000, description: 'Additional 20K miles after $2K more spend' },
    },
    earningRates: [
      { category: 'Delta & Hotels (direct)', multiplier: 3 },
      { category: 'Restaurants', multiplier: 2 },
      { category: 'U.S. Supermarkets', multiplier: 2 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'adp-checked-bag', name: 'First Checked Bag Free', description: 'Free first checked bag for you + up to 8 companions', category: 'travel-credit', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adp-boarding', name: 'Priority Boarding', description: 'Priority boarding on Delta flights', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adp-award-discount', name: '15% Off Award Travel', description: '15% off Delta award flights using miles', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adp-mqd-headstart', name: '$2,500 MQD Headstart', description: '$2,500 Medallion Qualification Dollars headstart each year', category: 'elite-status', annualValue: 0, renewalPeriod: 'annual' },
      { id: 'adp-mqd-boost', name: 'MQD Boost ($1 per $20)', description: 'Earn $1 MQD for every $20 spent on card', category: 'elite-status', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adp-resy', name: '$120 Resy Credit', description: '$10/month at eligible U.S. Resy restaurants', category: 'dining-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, requiresEnrollment: true },
      { id: 'adp-rideshare', name: '$120 Rideshare Credit', description: '$10/month for U.S. rideshare purchases', category: 'rideshare-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, requiresEnrollment: true },
      { id: 'adp-delta-stays', name: '$150 Delta Stays Credit', description: 'Annual credit for Delta Stays prepaid bookings', category: 'hotel-credit', annualValue: 150, renewalPeriod: 'annual' },
      { id: 'adp-ge-tsa', name: 'Global Entry/TSA PreCheck', description: 'Credit for GE ($120) every 4yr or TSA PreCheck ($85) every 4.5yr', category: 'global-entry-tsa', annualValue: 30, renewalPeriod: 'every-4-years' },
      { id: 'adp-companion', name: 'Companion Certificate', description: 'Annual Main Cabin domestic/Caribbean/Central America companion cert after renewal ($22-$250 taxes/fees)', category: 'companion-certificate', annualValue: 0, renewalPeriod: 'annual' },
      { id: 'adp-upgrades', name: 'Complimentary Upgrades', description: 'Added to upgrade list after Medallion Members and Reserve cardholders', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
  {
    id: 'amex-delta-reserve',
    name: 'Delta SkyMiles Reserve Amex',
    issuer: 'Amex',
    annualFee: 650,
    color: '#003a70',
    signupBonus: {
      points: 100000, spend: 6000, timeMonths: 6, unit: 'miles',
      additionalBonus: { points: 25000, spend: 3000, description: 'Additional 25K miles after $3K more spend' },
    },
    earningRates: [
      { category: 'Delta Purchases', multiplier: 3 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'adr-checked-bag', name: 'First Checked Bag Free', description: 'Free first checked bag for you + up to 8 companions', category: 'travel-credit', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adr-boarding', name: 'Priority Boarding + Upgrade Priority', description: 'Priority boarding and upgrade priority over same tier/fare', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adr-award-discount', name: '15% Off Award Travel', description: '15% off Delta award flights using miles', category: 'other', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adr-mqd-headstart', name: '$2,500 MQD Headstart', description: '$2,500 Medallion Qualification Dollars headstart each year', category: 'elite-status', annualValue: 0, renewalPeriod: 'annual' },
      { id: 'adr-mqd-boost', name: 'MQD Boost ($1 per $10)', description: 'Earn $1 MQD for every $10 spent on card', category: 'elite-status', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'adr-resy', name: '$240 Resy Credit', description: '$20/month at eligible U.S. Resy restaurants', category: 'dining-credit', annualValue: 240, renewalPeriod: 'monthly', periodValue: 20, requiresEnrollment: true },
      { id: 'adr-rideshare', name: '$120 Rideshare Credit', description: '$10/month for U.S. rideshare purchases', category: 'rideshare-credit', annualValue: 120, renewalPeriod: 'monthly', periodValue: 10, requiresEnrollment: true },
      { id: 'adr-delta-stays', name: '$200 Delta Stays Credit', description: 'Annual credit for Delta Stays prepaid bookings', category: 'hotel-credit', annualValue: 200, renewalPeriod: 'annual' },
      { id: 'adr-uber-one', name: '~12-mo Uber One Credit', description: 'Up to $9.99/mo for 12 consecutive months for Uber One membership (through 6/25/2026)', category: 'membership', annualValue: 120, renewalPeriod: 'one-time', expirationDate: '2026-06-25' },
      { id: 'adr-sky-club', name: 'Delta Sky Club Access', description: '15 visits/yr flying Delta, unlimited at $75K spend. Centurion & Escape Lounge access', category: 'lounge-access', annualValue: 0, renewalPeriod: 'annual' },
      { id: 'adr-ge-tsa', name: 'Global Entry/TSA PreCheck', description: 'Credit for GE ($120) every 4yr or TSA PreCheck ($85) every 4.5yr', category: 'global-entry-tsa', annualValue: 30, renewalPeriod: 'every-4-years' },
      { id: 'adr-companion', name: 'Companion Certificate', description: 'Annual First/Comfort+/Main Cabin domestic/Caribbean/Central America companion cert after renewal ($22-$250 taxes/fees)', category: 'companion-certificate', annualValue: 0, renewalPeriod: 'annual' },
    ],
  },

  // ─── CAPITAL ONE ───────────────────────────────────────────
  {
    id: 'capital-one-venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    annualFee: 95,
    color: '#d03027',
    signupBonus: { points: 75000, spend: 4000, timeMonths: 3, unit: 'miles' },
    earningRates: [
      { category: 'Hotels/Vacation Rentals/Rental Cars (Cap One Travel)', multiplier: 5 },
      { category: 'All Other', multiplier: 2 },
    ],
    perks: [
      { id: 'cov-travel-credit', name: '$250 Capital One Travel Credit', description: 'One-time $250 credit for Capital One Travel bookings in first year', category: 'travel-credit', annualValue: 250, renewalPeriod: 'one-time' },
      { id: 'cov-ge-tsa', name: '$100 Global Entry/TSA PreCheck', description: 'Credit for GE/TSA application fee every 4 years', category: 'global-entry-tsa', annualValue: 25, renewalPeriod: 'every-4-years' },
      { id: 'cov-hertz', name: 'Hertz Five Star Status', description: 'Complimentary Hertz Five Star elite status', category: 'elite-status', annualValue: 0, renewalPeriod: 'annual' },
    ],
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    annualFee: 395,
    color: '#d03027',
    signupBonus: { points: 75000, spend: 4000, timeMonths: 3, unit: 'miles' },
    earningRates: [
      { category: 'Hotels & Rental Cars (Cap One Travel)', multiplier: 10 },
      { category: 'Flights & Vacation Rentals (Cap One Travel)', multiplier: 5 },
      { category: 'All Other', multiplier: 2 },
    ],
    perks: [
      { id: 'covx-travel-credit', name: '$300 Travel Credit', description: 'Annual credit for bookings through Capital One Travel', category: 'travel-credit', annualValue: 300, renewalPeriod: 'annual' },
      { id: 'covx-anniversary-miles', name: '10K Anniversary Miles', description: '10,000 bonus miles each account anniversary (worth ~$100)', category: 'other', annualValue: 100, renewalPeriod: 'annual' },
      { id: 'covx-lounge', name: 'Capital One & Priority Pass Lounges', description: 'Access to Capital One Lounges and Priority Pass lounges', category: 'lounge-access', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'covx-ge-tsa', name: '$100 Global Entry/TSA PreCheck', description: 'Credit for GE/TSA application fee every 4 years', category: 'global-entry-tsa', annualValue: 25, renewalPeriod: 'every-4-years' },
      { id: 'covx-hertz', name: 'Hertz President\'s Circle', description: 'Complimentary Hertz President\'s Circle elite status', category: 'elite-status', annualValue: 0, renewalPeriod: 'annual' },
    ],
  },

  // ─── CITI ──────────────────────────────────────────────────
  {
    id: 'citi-custom-cash',
    name: 'Citi Custom Cash',
    issuer: 'Citi',
    annualFee: 0,
    color: '#003b70',
    signupBonus: { points: 20000, spend: 1500, timeMonths: 6, unit: 'cash back ($200)' },
    earningRates: [
      { category: 'Top Category (auto-detected)', multiplier: 5, limit: 'First $500/billing cycle' },
      { category: 'Citi Travel Hotels/Cars/Attractions', multiplier: 5 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [],
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    annualFee: 0,
    color: '#003b70',
    signupBonus: { points: 20000, spend: 1500, timeMonths: 6, unit: 'cash back ($200)' },
    earningRates: [
      { category: 'Everything (1% buy + 1% pay)', multiplier: 2 },
      { category: 'Citi Travel Hotels/Cars/Attractions', multiplier: 5 },
    ],
    perks: [
      { id: 'cdc-entertainment', name: 'Citi Entertainment', description: 'Access to presale tickets and experiences', category: 'entertainment-credit', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
  {
    id: 'citi-strata-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    annualFee: 95,
    color: '#003b70',
    signupBonus: { points: 60000, spend: 4000, timeMonths: 3, unit: 'points' },
    earningRates: [
      { category: 'Citi Travel Hotels/Cars/Attractions', multiplier: 10 },
      { category: 'Air Travel / Hotels / Restaurants / Supermarkets / Gas / EV Charging', multiplier: 3 },
      { category: 'All Other', multiplier: 1 },
    ],
    perks: [
      { id: 'csp2-hotel-credit', name: '$100 Hotel Credit', description: 'Annual credit for single hotel stay of $500+ (excl. taxes) through thankyou.com', category: 'hotel-credit', annualValue: 100, renewalPeriod: 'annual' },
      { id: 'csp2-trip-insurance', name: 'Travel Insurance Suite', description: 'Trip delay, trip cancellation, lost/damaged luggage, rental car insurance', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'csp2-extended-warranty', name: 'Extended Warranty', description: 'Extends manufacturer warranties by 2 years', category: 'insurance', annualValue: 0, renewalPeriod: 'ongoing' },
      { id: 'csp2-entertainment', name: 'Citi Entertainment & The Reserve', description: 'Access to Citi Entertainment and The Reserve curated hotel collection', category: 'entertainment-credit', annualValue: 0, renewalPeriod: 'ongoing' },
    ],
  },
];

// ============================================================
// Churning Rules
// ============================================================

export const churningRules: ChurningRule[] = [
  { id: 'chase-5-24', issuer: 'Chase', ruleName: 'Chase 5/24', description: 'Chase will likely deny your application if you\'ve opened 5+ personal credit cards across all issuers in the past 24 months. Business cards from most issuers don\'t count.', cooldownMonths: 24 },
  { id: 'chase-sapphire-lifetime', issuer: 'Chase', ruleName: 'Sapphire Once-Per-Lifetime', description: 'You can only receive the Sapphire bonus once per lifetime per product (Preferred or Reserve). You must not currently hold any Sapphire card to apply.', affectedCards: ['chase-sapphire-preferred', 'chase-sapphire-reserve'] },
  { id: 'amex-lifetime', issuer: 'Amex', ruleName: 'Once-Per-Lifetime', description: 'Amex limits welcome bonuses to once per lifetime per card product. Clock may reset after ~7 years. Watch for targeted "No Lifetime Language" (NLL) offers.', cooldownMonths: 84 },
  { id: 'amex-1-5', issuer: 'Amex', ruleName: '1/5 Rule', description: 'You can hold a maximum of 5 Amex credit cards at the same time.', affectedCards: [] },
  { id: 'amex-2-90', issuer: 'Amex', ruleName: '2/90 Rule', description: 'You can be approved for at most 2 new Amex credit cards within any 90-day period.', cooldownMonths: 3 },
  { id: 'capital-one-1-6', issuer: 'Capital One', ruleName: '1/6 Rule', description: 'Capital One generally approves only one new credit card (personal or business) every 6 months.', cooldownMonths: 6 },
  { id: 'capital-one-48', issuer: 'Capital One', ruleName: '48-Month Rule', description: 'You can only receive the Venture/Venture X welcome bonus once per 48 months per product.', cooldownMonths: 48, affectedCards: ['capital-one-venture', 'capital-one-venture-x'] },
  { id: 'citi-48', issuer: 'Citi', ruleName: '48-Month Rule', description: 'Citi limits welcome bonuses to once per 48 months per card family.', cooldownMonths: 48 },
];

// Expose to window for BDD testing
if (typeof window !== 'undefined') {
  const w = window as unknown as { cardTemplates: typeof cardTemplates };
  w.cardTemplates = cardTemplates;
}
