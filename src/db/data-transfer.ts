import { db } from './database';
import type { SignupBonus, UserCard, UserPerk } from './types';

export const BACKUP_VERSION = 1;

export interface DataBackup {
  format: 'credit-card-rewards-backup';
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    cards: UserCard[];
    signupBonuses: SignupBonus[];
    perks: UserPerk[];
  };
}

type BackupRecordType = keyof DataBackup['data'];

const recordTypes: BackupRecordType[] = ['cards', 'signupBonuses', 'perks'];

export async function createBackup(): Promise<DataBackup> {
  const [cards, signupBonuses, perks] = await Promise.all([
    db.cards.toArray(),
    db.signupBonuses.toArray(),
    db.perks.toArray(),
  ]);

  return {
    format: 'credit-card-rewards-backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { cards, signupBonuses, perks },
  };
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function backupToCsv(backup: DataBackup): string {
  const header = ['schemaVersion', 'exportedAt', 'recordType', 'data'].map(escapeCsv).join(',');
  const rows = recordTypes.flatMap(recordType => backup.data[recordType].map(record => [
    String(backup.version),
    backup.exportedAt,
    recordType,
    JSON.stringify(record),
  ].map(escapeCsv).join(',')));

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
  if (typeof record[field] !== 'string') throw new Error(`${label} has an invalid ${field}.`);
}

function requireNumber(record: Record<string, unknown>, field: string, label: string) {
  if (typeof record[field] !== 'number' || !Number.isFinite(record[field])) {
    throw new Error(`${label} has an invalid ${field}.`);
  }
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

  for (const type of recordTypes) {
    if (!Array.isArray(value.data[type])) throw new Error(`The backup is missing ${type}.`);
  }

  const cards = value.data.cards as unknown[];
  const bonuses = value.data.signupBonuses as unknown[];
  const perks = value.data.perks as unknown[];
  const cardIds = new Set<number>();

  cards.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Card ${index + 1} is invalid.`);
    requireNumber(item, 'id', `Card ${index + 1}`);
    requireString(item, 'cardTemplateId', `Card ${index + 1}`);
    requireString(item, 'openedDate', `Card ${index + 1}`);
    requireString(item, 'annualFeeDate', `Card ${index + 1}`);
    requireString(item, 'status', `Card ${index + 1}`);
    const id = item.id as number;
    if (!Number.isInteger(id) || id <= 0 || cardIds.has(id)) throw new Error(`Card ${index + 1} has a duplicate or invalid id.`);
    cardIds.add(id);
  });

  bonuses.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Sign-up bonus ${index + 1} is invalid.`);
    requireNumber(item, 'cardId', `Sign-up bonus ${index + 1}`);
    requireString(item, 'cardTemplateId', `Sign-up bonus ${index + 1}`);
    requireNumber(item, 'targetSpend', `Sign-up bonus ${index + 1}`);
    requireNumber(item, 'currentSpend', `Sign-up bonus ${index + 1}`);
    requireString(item, 'deadline', `Sign-up bonus ${index + 1}`);
    if (!cardIds.has(item.cardId as number)) throw new Error(`Sign-up bonus ${index + 1} refers to a missing card.`);
  });

  perks.forEach((item, index) => {
    if (!isObject(item)) throw new Error(`Perk ${index + 1} is invalid.`);
    requireNumber(item, 'cardId', `Perk ${index + 1}`);
    requireString(item, 'perkTemplateId', `Perk ${index + 1}`);
    requireString(item, 'perkName', `Perk ${index + 1}`);
    requireString(item, 'currentPeriodStart', `Perk ${index + 1}`);
    requireString(item, 'currentPeriodEnd', `Perk ${index + 1}`);
    if (!cardIds.has(item.cardId as number)) throw new Error(`Perk ${index + 1} refers to a missing card.`);
  });

  return value as unknown as DataBackup;
}

function backupFromCsv(text: string): DataBackup {
  const rows = parseCsvRows(text);
  const expectedHeader = ['schemaVersion', 'exportedAt', 'recordType', 'data'];
  if (rows.length === 0 || rows[0].join('|') !== expectedHeader.join('|')) {
    throw new Error('The CSV backup has an invalid header.');
  }

  const data: DataBackup['data'] = { cards: [], signupBonuses: [], perks: [] };
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
      data[row[2] as BackupRecordType].push(JSON.parse(row[3]) as never);
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
  await db.transaction('rw', db.cards, db.signupBonuses, db.perks, async () => {
    await Promise.all([db.signupBonuses.clear(), db.perks.clear(), db.cards.clear()]);
    if (validated.data.cards.length) await db.cards.bulkAdd(validated.data.cards);
    if (validated.data.signupBonuses.length) await db.signupBonuses.bulkAdd(validated.data.signupBonuses);
    if (validated.data.perks.length) await db.perks.bulkAdd(validated.data.perks);
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
