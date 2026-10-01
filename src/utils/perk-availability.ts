import { getLocalDateString } from './quarterly-rewards';
import { cardTemplates } from '../db/seed-data';
import type { PerkTemplate, UserPerk } from '../db/types';

/** Permanent expiration is inclusive and follows the app's local calendar day. */
export function isPerkAvailable(perk: PerkTemplate | undefined, now: Date = new Date()): boolean {
  const today = getLocalDateString(now);
  return !perk?.expirationDate || perk.expirationDate >= today;
}

/** Check the latest catalog even before lifecycle cleanup has run. */
export function isUserPerkAvailable(perk: UserPerk, now: Date = new Date()): boolean {
  for (const card of cardTemplates) {
    const template = card.perks.find(pt => pt.id === perk.perkTemplateId);
    if (template) return isPerkAvailable(template, now);
  }
  return true;
}
