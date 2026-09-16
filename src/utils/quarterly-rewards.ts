import { db } from '../db/database';
import type { CardTemplate, QuarterlyReward } from '../db/types';

export interface QuarterInfo {
  quarter: number;      // 1, 2, 3, 4
  year: number;         // e.g. 2026
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  label: string;        // e.g. "Q3 2026"
}

export function parseDate(dateInput: Date | string): Date {
  if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, d] = dateInput.split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0);
    }
    return new Date(dateInput);
  }
  return dateInput;
}

/** Returns the local date string formatted as YYYY-MM-DD */
export function getLocalDateString(date: Date = getEffectiveDate()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEffectiveDate(fallback: Date = new Date()): Date {
  if (typeof window !== 'undefined') {
    const mock = (window as unknown as { __mockDate?: Date | string }).__mockDate;
    if (mock) return parseDate(mock);
    const sessionMock = sessionStorage.getItem('mock_date');
    if (sessionMock) return parseDate(sessionMock);
  }
  return fallback;
}

export function getQuarterInfo(quarter: number, year: number): QuarterInfo {
  let startMonth = 1;
  let endMonth = 3;
  let endDay = 31;
  if (quarter === 1) {
    startMonth = 1; endMonth = 3; endDay = 31;
  } else if (quarter === 2) {
    startMonth = 4; endMonth = 6; endDay = 30;
  } else if (quarter === 3) {
    startMonth = 7; endMonth = 9; endDay = 30;
  } else if (quarter === 4) {
    startMonth = 10; endMonth = 12; endDay = 31;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const startDate = `${year}-${pad(startMonth)}-01`;
  const endDate = `${year}-${pad(endMonth)}-${pad(endDay)}`;
  return {
    quarter,
    year,
    startDate,
    endDate,
    label: `Q${quarter} ${year}`,
  };
}

export function getCurrentQuarter(date: Date = getEffectiveDate()): QuarterInfo {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return getQuarterInfo(q, date.getFullYear());
}

export function getNextQuarter(date: Date = getEffectiveDate()): QuarterInfo {
  const currentQ = Math.floor(date.getMonth() / 3) + 1;
  const currentYear = date.getFullYear();
  if (currentQ === 4) {
    return getQuarterInfo(1, currentYear + 1);
  }
  return getQuarterInfo(currentQ + 1, currentYear);
}

export function getPreviousQuarter(date: Date = getEffectiveDate()): QuarterInfo {
  const currentQ = Math.floor(date.getMonth() / 3) + 1;
  const currentYear = date.getFullYear();
  if (currentQ === 1) {
    return getQuarterInfo(4, currentYear - 1);
  }
  return getQuarterInfo(currentQ - 1, currentYear);
}

export function formatDateLabel(isoDate: string): string {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);
  return `${monthNames[m - 1]} ${d}, ${yearStr}`;
}

export function hasRotatingRewards(template?: CardTemplate, cardRewards?: QuarterlyReward[]): boolean {
  if (cardRewards && cardRewards.length > 0) return true;
  if (!template) return false;
  return template.earningRates.some(r => r.category.toLowerCase().includes('rotating'));
}

export async function addQuarterlyReward(
  params: {
    cardId: number;
    category: string;
    multiplier?: number;
    limit?: string;
    quarter: number;
    year: number;
    notes?: string;
  },
  referenceDate: Date = getEffectiveDate()
): Promise<number> {
  const qInfo = getQuarterInfo(params.quarter, params.year);
  const today = getLocalDateString(referenceDate);

  let status: 'active' | 'queued' | 'expired';
  if (today < qInfo.startDate) {
    status = 'queued';
  } else if (today > qInfo.endDate) {
    status = 'expired';
  } else {
    status = 'active';
  }

  const resolvedLimit =
    params.limit !== undefined
      ? params.limit.trim() || undefined
      : 'Up to $1,500/quarter';

  const id = await db.quarterlyRewards.add({
    cardId: params.cardId,
    category: params.category.trim(),
    multiplier: params.multiplier ?? 5,
    limit: resolvedLimit,
    quarter: params.quarter,
    year: params.year,
    status,
    startDate: qInfo.startDate,
    endDate: qInfo.endDate,
    notes: params.notes,
  } as QuarterlyReward);

  return id as number;
}

export async function removeQuarterlyReward(rewardId: number): Promise<void> {
  await db.quarterlyRewards.delete(rewardId);
}

export async function getQuarterlyRewardsForCard(cardId: number): Promise<QuarterlyReward[]> {
  return db.quarterlyRewards.where('cardId').equals(cardId).toArray();
}

export async function rotateQuarterlyRewards(
  referenceDate: Date = getEffectiveDate()
): Promise<{ activated: number; expired: number }> {
  const today = getLocalDateString(referenceDate);

  const queuedRewards = await db.quarterlyRewards
    .where('status')
    .equals('queued')
    .toArray();

  const activeRewards = await db.quarterlyRewards
    .where('status')
    .equals('active')
    .toArray();

  let activated = 0;
  let expired = 0;

  for (const reward of queuedRewards) {
    if (reward.startDate <= today) {
      if (reward.endDate >= today) {
        await db.quarterlyRewards.update(reward.id!, { status: 'active' });
        activated++;
      } else {
        await db.quarterlyRewards.update(reward.id!, { status: 'expired' });
        expired++;
      }
    }
  }

  for (const reward of activeRewards) {
    if (reward.endDate < today) {
      await db.quarterlyRewards.update(reward.id!, { status: 'expired' });
      expired++;
    }
  }

  return { activated, expired };
}

// Expose to window for testing
if (typeof window !== 'undefined') {
  const w = window as unknown as {
    rotateQuarterlyRewards: typeof rotateQuarterlyRewards;
    addQuarterlyReward: typeof addQuarterlyReward;
    removeQuarterlyReward: typeof removeQuarterlyReward;
    getCurrentQuarter: typeof getCurrentQuarter;
    getNextQuarter: typeof getNextQuarter;
    getQuarterInfo: typeof getQuarterInfo;
    setMockDate?: (date: string | Date | null) => void;
  };
  w.rotateQuarterlyRewards = rotateQuarterlyRewards;
  w.addQuarterlyReward = addQuarterlyReward;
  w.removeQuarterlyReward = removeQuarterlyReward;
  w.getCurrentQuarter = getCurrentQuarter;
  w.getNextQuarter = getNextQuarter;
  w.getQuarterInfo = getQuarterInfo;
  w.setMockDate = (date: string | Date | null) => {
    if (!date) {
      delete (window as unknown as { __mockDate?: Date }).__mockDate;
      sessionStorage.removeItem('mock_date');
    } else {
      const parsed = parseDate(date);
      (window as unknown as { __mockDate: Date }).__mockDate = parsed;
      const str = typeof date === 'string' ? date : getLocalDateString(parsed);
      sessionStorage.setItem('mock_date', str);
    }
  };
}
