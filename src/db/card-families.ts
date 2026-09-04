/** Canonical user-facing labels keyed by the family IDs stored on card templates. */
export const cardFamilyLabels = {
  'chase-ultimate-rewards-consumer': 'Chase Ultimate Rewards Consumer',
  'chase-united': 'Chase United',
  'chase-marriott-bonvoy': 'Chase Marriott Bonvoy',
  Hilton: 'Hilton',
  IHG: 'IHG',
  'bilt-card-2.0': 'Bilt Card 2.0',
  'skypass-visa': 'SKYPASS Visa',
} as const;

export type CardFamilyId = keyof typeof cardFamilyLabels;
