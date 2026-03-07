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
  (window as any).refreshExpiredPerks = refreshExpiredPerks;
}

// ── Card operations ──

export function getCardTemplate(templateId: string): CardTemplate | undefined {
  return cardTemplates.find(c => c.id === templateId);
}

export async function addCard(
  cardTemplateId: string,
  openedDate: string,
  nickname?: string,
  lastFourDigits?: string,
): Promise<number> {
  const template = getCardTemplate(cardTemplateId);
  if (!template) throw new Error(`Unknown card template: ${cardTemplateId}`);

  const opened = new Date(openedDate);
  const annualFeeDate = addMonths(opened, 12).toISOString().split('T')[0];

  const cardId = await db.cards.add({
    cardTemplateId,
    nickname,
    lastFourDigits,
    openedDate,
    annualFeeDate,
    status: 'active',
  } as UserCard);

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

export async function togglePerk(perkId: number): Promise<void> {
  const perk = await db.perks.get(perkId);
  if (!perk) return;
  await db.perks.update(perkId, {
    used: !perk.used,
    usedDate: !perk.used ? new Date().toISOString().split('T')[0] : undefined,
  });
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
    const newPeriod = computePeriod(perk.renewalPeriod, now);
    await db.perks.update(perk.id!, {
      used: false,
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
  
  // Only count personal cards that are not closed
  return userCards.filter(c => {
    if (c.status === 'closed') return false;
    const template = getCardTemplate(c.cardTemplateId);
    return template ? !template.isBusinessCard : true; // Default to counting if template not found (shouldn't happen)
  }).length;
}
