// ============================================================
// Credit Card Rewards PWA — Core Types
// ============================================================

/** Renewal period for a perk credit */
export type RenewalPeriod =
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual'
  | 'every-4-years'
  | 'one-time'
  | 'ongoing';

/** Card network / issuer */
export type CardIssuer = 'Chase' | 'Amex' | 'Capital One' | 'Citi';

/** Category of perk */
export type PerkCategory =
  | 'travel-credit'
  | 'hotel-credit'
  | 'dining-credit'
  | 'entertainment-credit'
  | 'shopping-credit'
  | 'rideshare-credit'
  | 'delivery-credit'
  | 'wellness-credit'
  | 'streaming-credit'
  | 'lounge-access'
  | 'elite-status'
  | 'insurance'
  | 'membership'
  | 'companion-certificate'
  | 'global-entry-tsa'
  | 'other';

// ---- Card Template (seed data) ----

export interface EarningRate {
  category: string;
  multiplier: number;
  limit?: string; // e.g. "$25K/yr", "first $500/cycle"
}

export interface PerkTemplate {
  id: string;
  name: string;
  description: string;
  details?: string;
  usageLink?: string;
  category: PerkCategory;
  annualValue: number;      // total annual dollar value
  renewalPeriod: RenewalPeriod;
  periodValue?: number;     // value per period (e.g. $10/mo)
  expirationDate?: string;  // ISO date if the perk expires (e.g. "2027-12-31")
  requiresEnrollment?: boolean;
}

export interface CardTemplate {
  id: string;
  name: string;
  issuer: CardIssuer;
  annualFee: number;
  firstYearFeeWaived?: boolean;
  color: string;            // brand hex color
  signupBonus: {
    points: number;
    spend: number;
    timeMonths: number;
    unit: string;           // "points", "miles", "cash back"
    additionalBonus?: {
      points: number;
      spend: number;
      description: string;
    };
  };
  earningRates: EarningRate[];
  perks: PerkTemplate[];
  isBusinessCard?: boolean;
}

export interface ChurningRule {
  id: string;
  issuer: CardIssuer;
  ruleName: string;
  description: string;
  cooldownMonths?: number;
  affectedCards?: string[]; // card template IDs
}

// ---- User Data (stored in IndexedDB) ----

export interface UserCard {
  id?: number;
  cardTemplateId: string;
  nickname?: string;
  lastFourDigits?: string;
  openedDate: string;       // ISO date
  annualFeeDate: string;    // ISO date for next annual fee
  status: 'active' | 'closed' | 'product-changed';
  closedDate?: string;
  notes?: string;
}

export interface SignupBonus {
  id?: number;
  cardId: number;           // FK to UserCard.id
  cardTemplateId: string;
  targetSpend: number;
  currentSpend: number;
  deadline: string;         // ISO date
  bonusPoints: number;
  bonusUnit: string;
  completed: boolean;
  completedDate?: string;
}

export interface UserPerk {
  id?: number;
  cardId: number;           // FK to UserCard.id
  perkTemplateId: string;
  perkName: string;
  category: PerkCategory;
  used: boolean;
  usedDate?: string;
  currentPeriodStart: string; // ISO date
  currentPeriodEnd: string;   // ISO date
  renewalPeriod: RenewalPeriod;
  annualValue: number;
  periodValue?: number;
}
