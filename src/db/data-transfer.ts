import { db } from './database';
import type { QuarterlyReward, SignupBonus, UserCard, UserPerk } from './types';

export const BACKUP_VERSION = 1;

export interface DataBackup {
  format: 'credit-card-rewards-backup';
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    cards: UserCard[];
    signupBonuses: SignupBonus[];
    perks: UserPerk[];
    quarterlyRewards?: QuarterlyReward[];
  };
}

type BackupRecordType = 'cards' | 'signupBonuses' | 'perks' | 'quarterlyRewards';

const recordTypes: BackupRecordType[] = ['cards', 'signupBonuses', 'perks', 'quarterlyRewards'];
const cardStatuses = ['active', 'closed', 'product-changed'] as const;
const rewardStatuses = ['active', 'queued', 'expired'] as const;
const perkCategories = [
  'travel-credit', 'hotel-credit', 'dining-credit', 'entertainment-credit',
  'shopping-credit', 'rideshare-credit', 'delivery-credit', 'wellness-credit',
  'streaming-credit', 'lounge-access', 'elite-status', 'insurance', 'membership',
  'companion-certificate', 'global-entry-tsa', 'other',
] as const;
const renewalPeriods = [
  'monthly', 'quarterly', 'semi-annual', 'annual', 'every-4-years',
  'one-time', 'ongoing',
] as const;

export async function createBackup(): Promise<DataBackup> {
  const [cards, signupBonuses, perks, quarterlyRewards] = await Promise.all([
    db.cards.toArray(),
    db.signupBonuses.toArray(),
    db.perks.toArray(),
    db.quarterlyRewards.toArray(),
  ]);

  return {
    format: 'credit-card-rewards-backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { cards, signupBonuses, perks, quarterlyRewards },
  };
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function backupToCsv(backup: DataBackup): string {
  const header = ['schemaVersion', 'exportedAt', 'recordType', 'data'].map(escapeCsv).join(',');
  const rows = recordTypes.flatMap(recordType => {
    const records = (backup.data[recordType] ?? []) as unknown[];
    return records.map(record => [
      String(backup.version),
      backup.exportedAt,
      recordType,
      JSON.stringify(record),
    ].map(escapeCsv).join(','));
  });

  return [header, ...rows].join('\r\n');
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (quoted) {
      if (char === '"' && csv[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error('The CSV file contains an unterminated quoted value.');
  if (value || row.length) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, field: string, label: string) {
  if (typeof record[field] !== 'string' || record[field].length === 0) {
    throw new Error(`${label} has an invalid ${field}.`);
  }
}

function requireNumber(record: Record<string, unknown>, field: string, label: string) {
  if (typeof record[field] !== 'number' || !Number.isFinite(record[field])) {
    throw new Error(`${label} has an invalid ${field}.`);
  }
}

function requireBoolean(record: Record<string, unknown>, field: string, label: string) {
  if (typeof record[field] !== 'boolean') throw new Error(`${label} has an invalid ${field}.`);
}

function requireEnum(
  record: Record<string, unknown>,
  field: string,
  values: readonly string[],
  label: string,
) {
  requireString(record, field, label);
  if (!values.includes(record[field] as string)) throw new Error(`${label} has an invalid ${field}.`);
}

function validateOptionalString(record: Record<string, unknown>, field: string, label: string) {
  if (record[field] !== undefined && typeof record[field] !== 'string') {
    throw new Error(`${label} has an invalid ${field}.`);
  }
}

function validateOptionalNumber(record: Record<string, unknown>, field: string, label: string) {
  if (record[field] !== undefined && (typeof record[field] !== 'number' || !Number.isFinite(record[field]))) {
    throw new Error(`${label} has an invalid ${field}.`);
  }
}

function validateOptionalBoolean(record: Record<string, unknown>, field: string, label: string) {
  if (record[field] !== undefined && typeof record[field] !== 'boolean') {
    throw new Error(`${label} has an invalid ${field}.`);
  }
}

function validateOptionalId(record: Record<string, unknown>, label: string, ids: Set<number>) {
  if (record.id === undefined) return;
  requireNumber(record, 'id', label);
  const id = record.id as number;
  if (!Number.isInteger(id) || id <= 0 || ids.has(id)) throw new Error(`${label} has a duplicate or invalid id.`);
  ids.add(id);
}

function validateAdditionalBonus(value: unknown, label: string) {
  if (value === undefined) return;
  if (!isObject(value)) throw new Error(`${label} has an invalid additionalBonus.`);
  requireNumber(value, 'points', `${label} additional bonus`);
  requireNumber(value, 'spend', `${label} additional bonus`);
  requireString(value, 'description', `${label} additional bonus`);
  validateOptionalString(value, 'unit', `${label} additional bonus`);
}

function validateBackup(value: unknown): DataBackup {
  if (!isObject(value) || value.format !== 'credit-card-rewards-backup') {
    throw new Error('This is not a Credit Card Rewards backup.');
  }
  if (value.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version. Expected version ${BACKUP_VERSION}.`);
  }
  if (typeof value.exportedAt !== 'string' || !isObject(value.data)) {
    throw new Error('The backup metadata is incomplete.');
  }

  const requiredRecordTypes = ['cards', 'signupBonuses', 'perks'] as const;
  for (const type of requiredRecordTypes) {
    if (!Array.isArray(value.data[type])) throw new Error(`The backup is missing ${type}.`);
  }

  if (value.data.quarterlyRewards !== undefined && !Array.isArray(value.data.quarterlyRewards)) {
    throw new Error('The backup is missing quarterlyRewards.');
  }

  const cards = value.data.cards as unknown[];
  const bonuses = value.data.signupBonuses as unknown[];
  const perks = value.data.perks as unknown[];
  const quarterlyRewards = (value.data.quarterlyRewards as unknown[]) ?? [];
  const cardIds = new Set<number>();
  const bonusIds = new Set<number>();
  const perkIds = new Set<number>();
  const rewardIds = new Set<number>();

  cards.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Card ${index + 1} is invalid.`);
    requireNumber(item, 'id', `Card ${index + 1}`);
    requireString(item, 'cardTemplateId', `Card ${index + 1}`);
    requireString(item, 'openedDate', `Card ${index + 1}`);
    requireString(item, 'annualFeeDate', `Card ${index + 1}`);
    requireEnum(item, 'status', cardStatuses, `Card ${index + 1}`);
    validateOptionalString(item, 'nickname', `Card ${index + 1}`);
    validateOptionalString(item, 'lastFourDigits', `Card ${index + 1}`);
    validateOptionalString(item, 'closedDate', `Card ${index + 1}`);
    validateOptionalString(item, 'notes', `Card ${index + 1}`);
    const id = item.id as number;
    if (!Number.isInteger(id) || id <= 0 || cardIds.has(id)) throw new Error(`Card ${index + 1} has a duplicate or invalid id.`);
    cardIds.add(id);
  });

  bonuses.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Sign-up bonus ${index + 1} is invalid.`);
    const label = `Sign-up bonus ${index + 1}`;
    validateOptionalId(item, label, bonusIds);
    requireNumber(item, 'cardId', label);
    requireString(item, 'cardTemplateId', label);
    requireNumber(item, 'targetSpend', label);
    requireNumber(item, 'currentSpend', label);
    requireString(item, 'deadline', label);
    requireNumber(item, 'bonusPoints', label);
    requireString(item, 'bonusUnit', label);
    requireBoolean(item, 'completed', label);
    validateOptionalString(item, 'completedDate', label);
    validateAdditionalBonus(item.additionalBonus, label);
    if (!cardIds.has(item.cardId as number)) throw new Error(`Sign-up bonus ${index + 1} refers to a missing card.`);
  });

  perks.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Perk ${index + 1} is invalid.`);
    const label = `Perk ${index + 1}`;
    validateOptionalId(item, label, perkIds);
    requireNumber(item, 'cardId', label);
    requireString(item, 'perkTemplateId', label);
    requireString(item, 'perkName', label);
    requireEnum(item, 'category', perkCategories, label);
    requireBoolean(item, 'used', label);
    validateOptionalString(item, 'usedDate', label);
    validateOptionalBoolean(item, 'active', label);
    requireString(item, 'currentPeriodStart', label);
    requireString(item, 'currentPeriodEnd', label);
    requireEnum(item, 'renewalPeriod', renewalPeriods, label);
    requireNumber(item, 'annualValue', label);
    validateOptionalNumber(item, 'periodValue', label);
    if (!cardIds.has(item.cardId as number)) throw new Error(`Perk ${index + 1} refers to a missing card.`);
  });

function isValidIsoDateString(str: unknown): str is string {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function getExpectedQuarterDates(quarter: number, year: number) {
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
  return {
    startDate: `${year}-${pad(startMonth)}-01`,
    endDate: `${year}-${pad(endMonth)}-${pad(endDay)}`,
  };
}

  quarterlyRewards.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Quarterly reward ${index + 1} is invalid.`);
    const label = `Quarterly reward ${index + 1}`;
    validateOptionalId(item, label, rewardIds);
    requireNumber(item, 'cardId', label);
    requireString(item, 'category', label);
    requireNumber(item, 'multiplier', label);
    if (typeof item.multiplier !== 'number' || !Number.isFinite(item.multiplier) || item.multiplier <= 0) {
      throw new Error(`${label} has an invalid multiplier.`);
    }
    validateOptionalString(item, 'limit', label);
    requireNumber(item, 'quarter', label);
    const quarter = item.quarter as number;
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      throw new Error(`${label} has an invalid quarter.`);
    }
    requireNumber(item, 'year', label);
    const year = item.year as number;
    if (!Number.isInteger(year) || year <= 0) {
      throw new Error(`${label} has an invalid year.`);
    }
    requireEnum(item, 'status', rewardStatuses, label);
    requireString(item, 'startDate', label);
    if (!isValidIsoDateString(item.startDate)) {
      throw new Error(`${label} has an invalid startDate.`);
    }
    requireString(item, 'endDate', label);
    if (!isValidIsoDateString(item.endDate)) {
      throw new Error(`${label} has an invalid endDate.`);
    }
    const expectedBounds = getExpectedQuarterDates(quarter, year);
    if (item.startDate !== expectedBounds.startDate || item.endDate !== expectedBounds.endDate || item.startDate > item.endDate) {
      throw new Error(`${label} dates are inconsistent with quarter and year.`);
    }
    validateOptionalString(item, 'notes', label);
    if (!cardIds.has(item.cardId as number)) throw new Error(`Quarterly reward ${index + 1} refers to a missing card.`);
  });

  return {
    ...value,
    data: {
      cards,
      signupBonuses: bonuses,
      perks,
      quarterlyRewards,
    },
  } as DataBackup;
}

function backupFromCsv(text: string): DataBackup {
  const rows = parseCsvRows(text);
  const expectedHeader = ['schemaVersion', 'exportedAt', 'recordType', 'data'];
  if (rows.length === 0 || rows[0].join('|') !== expectedHeader.join('|')) {
    throw new Error('The CSV backup has an invalid header.');
  }

  const data: DataBackup['data'] = { cards: [], signupBonuses: [], perks: [], quarterlyRewards: [] };
  let exportedAt = '';
  let version: number | undefined;

  rows.slice(1).filter(row => row.some(Boolean)).forEach((row, index) => {
    if (row.length !== 4) throw new Error(`CSV row ${index + 2} is invalid.`);
    const rowVersion = Number(row[0]);
    if (version === undefined) version = rowVersion;
    if (version !== rowVersion) throw new Error('The CSV contains mixed backup versions.');
    if (!exportedAt) exportedAt = row[1];
    if (!recordTypes.includes(row[2] as BackupRecordType)) throw new Error(`CSV row ${index + 2} has an unknown record type.`);
    try {
      ((data[row[2] as BackupRecordType] ??= []) as unknown[]).push(JSON.parse(row[3]));
    } catch {
      throw new Error(`CSV row ${index + 2} contains invalid record data.`);
    }
  });

  return validateBackup({
    format: 'credit-card-rewards-backup',
    version: version ?? BACKUP_VERSION,
    exportedAt: exportedAt || new Date(0).toISOString(),
    data,
  });
}

export function parseBackup(text: string, fileName = ''): DataBackup {
  if (fileName.toLowerCase().endsWith('.csv')) return backupFromCsv(text);
  try {
    return validateBackup(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('The JSON backup is not valid.');
    throw error;
  }
}

export async function restoreBackup(backup: DataBackup): Promise<void> {
  const validated = validateBackup(backup);
  await db.transaction('rw', db.cards, db.signupBonuses, db.perks, db.quarterlyRewards, async () => {
    await Promise.all([
      db.signupBonuses.clear(),
      db.perks.clear(),
      db.quarterlyRewards.clear(),
      db.cards.clear(),
    ]);
    if (validated.data.cards.length) await db.cards.bulkAdd(validated.data.cards);
    if (validated.data.signupBonuses.length) await db.signupBonuses.bulkAdd(validated.data.signupBonuses);
    if (validated.data.perks.length) await db.perks.bulkAdd(validated.data.perks);
    if (validated.data.quarterlyRewards && validated.data.quarterlyRewards.length) {
      await db.quarterlyRewards.bulkAdd(validated.data.quarterlyRewards);
    }
  });
}

export function downloadBackup(backup: DataBackup, format: 'json' | 'csv'): void {
  const content = format === 'json' ? JSON.stringify(backup, null, 2) : backupToCsv(backup);
  const date = backup.exportedAt.slice(0, 10);
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `credit-card-rewards-${date}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
