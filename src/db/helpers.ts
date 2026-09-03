import { db } from './database';
import { cardTemplates } from './seed-data';
import type { UserCard, SignupBonus, UserPerk, CardTemplate, PerkTemplate, RenewalPeriod } from './types';

// ── Helpers for computing renewal dates ──

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), q, 1);
}

function endOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3) * 3 + 2;
  return new Date(date.getFullYear(), q + 1, 0);
}

function startOfHalf(date: Date): Date {
  const h = date.getMonth() < 6 ? 0 : 6;
  return new Date(date.getFullYear(), h, 1);
}

function endOfHalf(date: Date): Date {
  const h = date.getMonth() < 6 ? 5 : 11;
  return new Date(date.getFullYear(), h + 1, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

export function computePeriod(renewalPeriod: RenewalPeriod, now: Date = new Date()): { start: string; end: string } {
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  switch (renewalPeriod) {
    case 'monthly':
      return { start: fmt(startOfMonth(now)), end: fmt(endOfMonth(now)) };
    case 'quarterly':
      return { start: fmt(startOfQuarter(now)), end: fmt(endOfQuarter(now)) };
    case 'semi-annual':
      return { start: fmt(startOfHalf(now)), end: fmt(endOfHalf(now)) };
    case 'annual':
      return { start: fmt(startOfYear(now)), end: fmt(endOfYear(now)) };
    case 'every-4-years':
      return { start: fmt(startOfYear(now)), end: fmt(new Date(now.getFullYear() + 4, 0, 1)) };
    case 'one-time':
    case 'ongoing':
    default:
      return { start: fmt(now), end: '9999-12-31' };
  }
}

// Expose to window for BDD testing
if (typeof window !== 'undefined') {
  const w = window as unknown as {
    refreshExpiredPerks: typeof refreshExpiredPerks;
    syncCardPerks: typeof syncCardPerks;
    productChangeCard: typeof productChangeCard;
    getEligibleProductChangeTemplates: typeof getEligibleProductChangeTemplates;
    getFamilyIds: typeof getFamilyIds;
    getFamilyTemplates: typeof getFamilyTemplates;
    getFamilyHistory: typeof getFamilyHistory;
    isFamilyEligible: typeof isFamilyEligible;
  };
  w.refreshExpiredPerks = refreshExpiredPerks;
  w.syncCardPerks = syncCardPerks;
  w.productChangeCard = productChangeCard;
  w.getEligibleProductChangeTemplates = getEligibleProductChangeTemplates;
  w.getFamilyIds = getFamilyIds;
  w.getFamilyTemplates = getFamilyTemplates;
  w.getFamilyHistory = getFamilyHistory;
  w.isFamilyEligible = isFamilyEligible;
}

// ── Card operations ──

export function getCardTemplate(templateId: string): CardTemplate | undefined {
  return cardTemplates.find(c => c.id === templateId);
}

/** Return the distinct loyalty families represented in the catalog. */
export function getFamilyIds(): string[] {
  return [...new Set(cardTemplates.map(card => card.familyId).filter((familyId): familyId is string => Boolean(familyId)))];
}

/** Return catalog products belonging to a loyalty family. */
export function getFamilyTemplates(familyId: string): CardTemplate[] {
  return cardTemplates.filter(c => c.familyId === familyId);
}

/** Return a user's complete family history, including closed/product-changed cards. */
export async function getFamilyHistory(familyId: string): Promise<UserCard[]> {
  const cards = await db.cards.toArray();
  return cards.filter(card => getCardTemplate(card.cardTemplateId)?.familyId === familyId);
}

/** Informational family status: false means prior family history exists; it does not block addCard. */
export async function isFamilyEligible(familyId: string): Promise<boolean> {
  return (await getFamilyHistory(familyId)).length === 0;
}

export async function addCard(
  cardTemplateId: string,
  openedDate: string,
  nickname?: string,
  lastFourDigits?: string,
  annualFeeDate?: string,
): Promise<number> {
  const template = getCardTemplate(cardTemplateId);
  if (!template) throw new Error(`Unknown card template: ${cardTemplateId}`);

  const opened = new Date(openedDate);

  const cardId = await db.cards.add({
    cardTemplateId,
    nickname,
    lastFourDigits,
    openedDate,
    annualFeeDate: annualFeeDate || addMonths(new Date(openedDate), 12).toISOString().split('T')[0],
    status: 'active',
  } as UserCard);

  // Family history is informational only; every newly added card gets its own signup-bonus tracker.
  // Product changes intentionally skip this block because they do not earn a signup bonus.
  // Create signup bonus tracker
  const deadline = addMonths(opened, template.signupBonus.timeMonths).toISOString().split('T')[0];
  await db.signupBonuses.add({
    cardId: cardId as number,
    cardTemplateId,
    targetSpend: template.signupBonus.spend,
    currentSpend: 0,
    deadline,
    bonusPoints: template.signupBonus.points,
    bonusUnit: template.signupBonus.unit,
    completed: false,
    additionalBonus: template.signupBonus.additionalBonus,
  } as SignupBonus);

  // Create perk instances
  const now = new Date();
  const perksToAdd: UserPerk[] = template.perks.map((p: PerkTemplate) => {
    const period = computePeriod(p.renewalPeriod, now);
    return {
      cardId: cardId as number,
      perkTemplateId: p.id,
      perkName: p.name,
      category: p.category,
      used: false,
      active: p.requiresEnrollment ? false : true,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      renewalPeriod: p.renewalPeriod,
      annualValue: p.annualValue,
      periodValue: p.periodValue,
    } as UserPerk;
  });

  await db.perks.bulkAdd(perksToAdd);
  return cardId as number;
}

export async function removeCard(cardId: number): Promise<void> {
  await db.perks.where('cardId').equals(cardId).delete();
  await db.signupBonuses.where('cardId').equals(cardId).delete();
  await db.cards.delete(cardId);
}

export async function updateCard(
  cardId: number,
  updates: { nickname?: string; lastFourDigits?: string; annualFeeDate?: string }
): Promise<void> {
  await db.cards.update(cardId, updates);
}

export function getEligibleProductChangeTemplates(currentTemplateId: string): {
  upgrades: CardTemplate[];
  downgrades: CardTemplate[];
  sameTier: CardTemplate[];
  allEligible: CardTemplate[];
} {
  const currentTemplate = getCardTemplate(currentTemplateId);
  if (!currentTemplate) return { upgrades: [], downgrades: [], sameTier: [], allEligible: [] };

  // Product changes require an explicitly modeled family. Missing family IDs
  // must never make unrelated same-issuer products eligible by accident.
  const eligible = currentTemplate.familyId
    ? cardTemplates.filter(
        c => c.issuer === currentTemplate.issuer
          && c.id !== currentTemplate.id
          && Boolean(c.familyId)
          && c.familyId === currentTemplate.familyId
      )
    : [];

  const upgrades = eligible.filter(c => c.annualFee > currentTemplate.annualFee);
  const downgrades = eligible.filter(c => c.annualFee < currentTemplate.annualFee);
  const sameTier = eligible.filter(c => c.annualFee === currentTemplate.annualFee);

  return { upgrades, downgrades, sameTier, allEligible: eligible };
}

export async function productChangeCard(
  cardId: number,
  targetTemplateId: string,
  options?: {
    nickname?: string;
    lastFourDigits?: string;
    annualFeeDate?: string;
  }
): Promise<number> {
  const oldCard = await db.cards.get(cardId);
  if (!oldCard) throw new Error(`Card not found with ID: ${cardId}`);

  const oldTemplate = getCardTemplate(oldCard.cardTemplateId);
  const targetTemplate = getCardTemplate(targetTemplateId);

  if (!oldTemplate || !targetTemplate) {
    throw new Error('Invalid card template for product change');
  }

  if (oldTemplate.issuer !== targetTemplate.issuer) {
    throw new Error(`Product change must be within the same publisher (${oldTemplate.issuer})`);
  }

  if (oldTemplate.id === targetTemplate.id) {
    throw new Error('Product change target must be different from the current card');
  }

  if (!oldTemplate.familyId || !targetTemplate.familyId || oldTemplate.familyId !== targetTemplate.familyId) {
    throw new Error('Product change must stay within the same card family');
  }

  const today = new Date().toISOString().split('T')[0];

  // 1. Update old card status to 'product-changed'
  await db.cards.update(cardId, {
    status: 'product-changed',
    closedDate: today,
  });

  // 2. Remove old card's un-used perks so they do not linger in active perks tracker
  await db.perks.where('cardId').equals(cardId).and(p => !p.used).delete();

  // 3. Create new active card preserving account history
  const newCardId = await db.cards.add({
    cardTemplateId: targetTemplateId,
    nickname: options?.nickname ?? (oldCard.nickname ? `${oldCard.nickname}` : undefined),
    lastFourDigits: options?.lastFourDigits ?? oldCard.lastFourDigits,
    openedDate: oldCard.openedDate, // Preserves original account age
    annualFeeDate: options?.annualFeeDate ?? oldCard.annualFeeDate,
    status: 'active',
  } as UserCard);

  // 4. Create new perks for the target template
  const now = new Date();
  const perksToAdd: UserPerk[] = targetTemplate.perks.map((p: PerkTemplate) => {
    const period = computePeriod(p.renewalPeriod, now);
    return {
      cardId: newCardId as number,
      perkTemplateId: p.id,
      perkName: p.name,
      category: p.category,
      used: false,
      active: p.requiresEnrollment ? false : true,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      renewalPeriod: p.renewalPeriod,
      annualValue: p.annualValue,
      periodValue: p.periodValue,
    } as UserPerk;
  });

  await db.perks.bulkAdd(perksToAdd);

  // Note: Product changes do not earn a sign-up bonus according to issuer rules.

  return newCardId as number;
}

export async function updateBonusSpend(bonusId: number, newSpend: number): Promise<void> {
  const bonus = await db.signupBonuses.get(bonusId);
  if (!bonus) return;
  const completed = newSpend >= bonus.targetSpend;
  await db.signupBonuses.update(bonusId, {
    currentSpend: newSpend,
    completed,
    completedDate: completed && !bonus.completed ? new Date().toISOString().split('T')[0] : bonus.completedDate,
  });
}

export async function updateSignupBonus(
  bonusId: number,
  updates: { targetSpend?: number; bonusPoints?: number; bonusUnit?: string; deadline?: string }
): Promise<void> {
  const bonus = await db.signupBonuses.get(bonusId);
  if (!bonus) return;

  const newTargetSpend = updates.targetSpend ?? bonus.targetSpend;
  const newCompleted = bonus.currentSpend >= newTargetSpend;

  await db.signupBonuses.update(bonusId, {
    ...updates,
    completed: newCompleted,
    completedDate: newCompleted && !bonus.completed ? new Date().toISOString().split('T')[0] : (newCompleted ? bonus.completedDate : undefined),
  });
}

export async function togglePerk(perkId: number): Promise<void> {
  const perk = await db.perks.get(perkId);
  if (!perk) return;
  await db.perks.update(perkId, {
    used: !perk.used,
    usedDate: !perk.used ? new Date().toISOString().split('T')[0] : undefined,
  });
}

export async function togglePerkActivation(perkId: number, active: boolean): Promise<void> {
  const perk = await db.perks.get(perkId);
  if (!perk) return;
  await db.perks.update(perkId, {
    active,
  });
}

// ── Sync Perks with Catalog ──

export async function syncCardPerks(): Promise<void> {
  const cards = await db.cards.where('status').equals('active').toArray();
  const now = new Date();

  for (const card of cards) {
    const template = getCardTemplate(card.cardTemplateId);
    if (!template) continue;

    const existingPerks = await db.perks.where('cardId').equals(card.id!).toArray();
    
    // 1. Delete unused perks that are no longer in the template
    for (const p of existingPerks) {
      if (p.used) continue;
      const inTemplate = template.perks.find(pt => pt.id === p.perkTemplateId);
      if (!inTemplate) {
        await db.perks.delete(p.id!);
      }
    }

    // 2. Update existing unused perks with latest template data
    for (const p of existingPerks) {
      if (p.used) continue;
      const inTemplate = template.perks.find(pt => pt.id === p.perkTemplateId);
      if (inTemplate) {
        await db.perks.update(p.id!, {
          perkName: inTemplate.name,
          category: inTemplate.category,
          renewalPeriod: inTemplate.renewalPeriod,
          annualValue: inTemplate.annualValue,
          periodValue: inTemplate.periodValue,
          active: p.active !== false,
        });
      }
    }

    // 3. Add missing perks that are newly added to the template
    for (const pt of template.perks) {
      const existing = existingPerks.find(p => p.perkTemplateId === pt.id);
      if (!existing) {
        const period = computePeriod(pt.renewalPeriod, now);
        await db.perks.add({
          cardId: card.id!,
          perkTemplateId: pt.id,
          perkName: pt.name,
          category: pt.category,
          used: false,
          active: pt.requiresEnrollment ? false : true,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          renewalPeriod: pt.renewalPeriod,
          annualValue: pt.annualValue,
          periodValue: pt.periodValue,
        } as UserPerk);
      }
    }
  }
}

// ── Auto-refresh expired perks ──

export async function refreshExpiredPerks(): Promise<number> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const expiredPerks = await db.perks
    .where('currentPeriodEnd')
    .below(today)
    .toArray();

  let refreshed = 0;
  for (const perk of expiredPerks) {
    if (perk.renewalPeriod === 'one-time' || perk.renewalPeriod === 'ongoing') continue;
    
    const card = await db.cards.get(perk.cardId);
    if (!card) continue;
    const template = getCardTemplate(card.cardTemplateId);
    if (!template) continue;

    const perkTemplate = template.perks.find(p => p.id === perk.perkTemplateId);
    if (!perkTemplate) {
      // Perk was removed from catalog; delete the user perk now that its period ended
      await db.perks.delete(perk.id!);
      continue;
    }

    const newPeriod = computePeriod(perkTemplate.renewalPeriod, now);
    await db.perks.update(perk.id!, {
      perkName: perkTemplate.name,
      category: perkTemplate.category,
      renewalPeriod: perkTemplate.renewalPeriod,
      annualValue: perkTemplate.annualValue,
      periodValue: perkTemplate.periodValue,
      used: false,
      active: perk.active !== false,
      usedDate: undefined,
      currentPeriodStart: newPeriod.start,
      currentPeriodEnd: newPeriod.end,
    });
    refreshed++;
  }
  return refreshed;
}

// ── Churning helpers ──

export async function getCardsOpenedInLast24Months(): Promise<number> {
  const cutoff = addMonths(new Date(), -24).toISOString().split('T')[0];
  const userCards = await db.cards.where('openedDate').aboveOrEqual(cutoff).toArray();
  
  // A product change creates an active replacement while retaining the old
  // record for history. Count active records only so one account is not
  // double-counted in Chase 5/24 after a product change.
  return userCards.filter(c => {
    if (c.status !== 'active') return false;
    const template = getCardTemplate(c.cardTemplateId);
    return template ? !template.isBusinessCard : true; // Default to counting if template not found (shouldn't happen)
  }).length;
}

// ── Perk expiry/renewal helpers ──

/** Days between today and an ISO date string. Negative = past. */
export function daysUntilDate(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get unused perks whose current period ends within `daysThreshold` days. */
export async function getExpiringPerks(daysThreshold: number = 7): Promise<UserPerk[]> {
  const allPerks = await db.perks.toArray();
  return allPerks.filter(p => {
    if (p.used) return false;
    if (p.active === false) return false;
    if (p.renewalPeriod === 'ongoing' || p.renewalPeriod === 'one-time') return false;
    if (p.annualValue <= 0) return false;
    const daysLeft = daysUntilDate(p.currentPeriodEnd);
    return daysLeft >= 0 && daysLeft <= daysThreshold;
  });
}

/** Get active cards with an annual fee due within `daysThreshold` days. */
export async function getUpcomingAnnualFees(daysThreshold: number = 30): Promise<UserCard[]> {
  const activeCards = await db.cards.where('status').equals('active').toArray();
  return activeCards.filter(c => {
    const daysLeft = daysUntilDate(c.annualFeeDate);
    return daysLeft >= 0 && daysLeft <= daysThreshold;
  });
}

/**
 * Get perks whose underlying template has a permanent expirationDate
 * within `daysThreshold` days. These perks will stop existing entirely.
 */
export async function getPermanentlyExpiringPerks(daysThreshold: number = 30): Promise<(UserPerk & { expirationDate: string })[]> {
  const allPerks = await db.perks.toArray();
  const results: (UserPerk & { expirationDate: string })[] = [];
  for (const perk of allPerks) {
    // Find the template to check expirationDate
    const card = await db.cards.get(perk.cardId);
    if (!card) continue;
    const cardTemplate = getCardTemplate(card.cardTemplateId);
    if (!cardTemplate) continue;
    const perkTemplate = cardTemplate.perks.find(pt => pt.id === perk.perkTemplateId);
    if (!perkTemplate?.expirationDate) continue;
    const daysLeft = daysUntilDate(perkTemplate.expirationDate);
    if (daysLeft >= 0 && daysLeft <= daysThreshold) {
      results.push({ ...perk, expirationDate: perkTemplate.expirationDate });
    }
  }
  return results;
}
