import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I open data transfer', async function () {
  await this.page.getByRole('button', { name: 'Export / Import Data' }).click();
  await expect(this.page.getByRole('dialog', { name: 'Export or import data' })).toBeVisible();
});

When('I export a JSON backup', async function () {
  const downloadPromise = this.page.waitForEvent('download');
  await this.page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const content = await (await download.createReadStream()).toArray().then((chunks: Buffer[]) => Buffer.concat(chunks).toString());
  this.downloadedBackup = content;
  this.downloadedJsonBackup = content;
});

Then('the downloaded JSON backup should contain {string}', async function (templateId: string) {
  const backup = JSON.parse(this.downloadedJsonBackup || this.downloadedBackup);
  expect(backup.format).toBe('credit-card-rewards-backup');
  expect(backup.data.cards.some((card: { cardTemplateId: string }) => card.cardTemplateId === templateId)).toBe(true);
  expect(backup.data.signupBonuses.length).toBeGreaterThan(0);
  expect(backup.data.perks.length).toBeGreaterThan(0);
});

When('I export a CSV backup', async function () {
  const downloadPromise = this.page.waitForEvent('download');
  await this.page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const content = await (await download.createReadStream()).toArray().then((chunks: Buffer[]) => Buffer.concat(chunks).toString());
  this.downloadedBackup = content;
  this.downloadedCsvBackup = content;
});

Then('the downloaded CSV backup should contain cards, bonuses, and perks', function () {
  expect(this.downloadedBackup).toContain('"cards"');
  expect(this.downloadedBackup).toContain('"signupBonuses"');
  expect(this.downloadedBackup).toContain('"perks"');
});

When('I choose a backup containing an Amex Gold card', async function () {
  const backup = {
    format: 'credit-card-rewards-backup',
    version: 1,
    exportedAt: '2026-09-04T12:00:00.000Z',
    data: {
      cards: [{
        id: 1,
        cardTemplateId: 'amex-gold',
        openedDate: '2026-01-01',
        annualFeeDate: '2027-01-01',
        status: 'active',
      }],
      signupBonuses: [],
      perks: [],
    },
  };
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
});

Then('I should see a preview of 1 card', async function () {
  await expect(this.page.getByText('1 cards · 0 bonuses · 0 perks')).toBeVisible();
});

When('I replace the device data with the backup', async function () {
  await this.page.getByRole('button', { name: 'Replace data and import' }).click();
  await expect(this.page.getByText('Backup imported successfully!')).toBeVisible();
});

When('I choose a backup with an incomplete sign-up bonus', async function () {
  const backup = {
    format: 'credit-card-rewards-backup',
    version: 1,
    exportedAt: '2026-09-04T12:00:00.000Z',
    data: {
      cards: [{ id: 1, cardTemplateId: 'amex-gold', openedDate: '2026-01-01', annualFeeDate: '2027-01-01', status: 'active' }],
      signupBonuses: [{
        id: 1,
        cardId: 1,
        cardTemplateId: 'amex-gold',
        targetSpend: 6000,
        currentSpend: 0,
        deadline: '2027-01-01',
        bonusUnit: 'points',
        completed: false,
      }],
      perks: [],
    },
  };
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'incomplete.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
});

Then('I should see the backup error {string}', async function (message: string) {
  await expect(this.page.getByRole('alert')).toHaveText(message);
});

Then('I should not be able to replace the device data', async function () {
  await expect(this.page.getByRole('button', { name: 'Replace data and import' })).toHaveCount(0);
});

When('two backup file reads finish out of order', async function () {
  await this.page.evaluate(() => {
    const originalText = File.prototype.text;
    let readNumber = 0;
    File.prototype.text = function () {
      readNumber += 1;
      const result = originalText.call(this);
      if (readNumber !== 1) return result;
      return new Promise<string>((resolve, reject) => {
        window.setTimeout(() => result.then(resolve, reject), 250);
      });
    };
  });

  const makeBackup = (cardCount: number) => JSON.stringify({
    format: 'credit-card-rewards-backup',
    version: 1,
    exportedAt: '2026-09-04T12:00:00.000Z',
    data: {
      cards: Array.from({ length: cardCount }, (_, index) => ({
        id: index + 1,
        cardTemplateId: 'amex-gold',
        openedDate: '2026-01-01',
        annualFeeDate: '2027-01-01',
        status: 'active',
      })),
      signupBonuses: [],
      perks: [],
    },
  });
  const input = this.page.getByLabel('Choose backup file');
  await input.setInputFiles({ name: 'older.json', mimeType: 'application/json', buffer: Buffer.from(makeBackup(2)) });
  await input.setInputFiles({ name: 'newer.json', mimeType: 'application/json', buffer: Buffer.from(makeBackup(1)) });
});

Then('the newer backup should remain selected', async function () {
  await expect(this.page.getByText('newer.json')).toBeVisible();
  await expect(this.page.getByText('1 cards · 0 bonuses · 0 perks')).toBeVisible();
  await this.page.waitForTimeout(350);
  await expect(this.page.getByText('newer.json')).toBeVisible();
  await expect(this.page.getByText('1 cards · 0 bonuses · 0 perks')).toBeVisible();
});

Then('the downloaded JSON backup should contain active and queued quarterly rewards', async function () {
  const backup = JSON.parse(this.downloadedBackup);
  expect(backup.format).toBe('credit-card-rewards-backup');
  expect(Array.isArray(backup.data.quarterlyRewards)).toBe(true);
  const rewards = backup.data.quarterlyRewards as Array<{ status: string; category: string }>;
  expect(rewards.some(r => r.status === 'active')).toBe(true);
  expect(rewards.some(r => r.status === 'queued')).toBe(true);
});

Then('the downloaded CSV backup should contain quarterly rewards', function () {
  expect(this.downloadedBackup).toContain('"quarterlyRewards"');
});

When('I clear the saved data', async function () {
  await this.page.evaluate(async () => {
    const w = window as unknown as {
      db: {
        cards: { clear: () => Promise<void> };
        signupBonuses: { clear: () => Promise<void> };
        perks: { clear: () => Promise<void> };
        quarterlyRewards: { clear: () => Promise<void> };
      };
    };
    await Promise.all([
      w.db.cards.clear(),
      w.db.signupBonuses.clear(),
      w.db.perks.clear(),
      w.db.quarterlyRewards.clear(),
    ]);
  });
});

When('I choose the exported JSON backup', async function () {
  const content = this.downloadedJsonBackup || this.downloadedBackup;
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'exported-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(content),
  });
});

When('I choose the exported CSV backup', async function () {
  const content = this.downloadedCsvBackup || this.downloadedBackup;
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'exported-backup.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(content),
  });
});

function cardNameToTemplateId(cardName: string): string {
  const map: Record<string, string> = {
    'Chase Freedom Flex': 'chase-freedom-flex',
    'Chase Freedom': 'chase-freedom',
    'Chase Freedom Unlimited': 'chase-freedom-unlimited',
    'Chase Sapphire Preferred': 'chase-sapphire-preferred',
    'American Express Gold': 'amex-gold',
    'Amex Gold': 'amex-gold',
  };
  return map[cardName] || cardName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

Then('the database should contain active and queued quarterly rewards for {string}', async function (cardName: string) {
  const expectedTemplateId = cardNameToTemplateId(cardName);
  const result = await this.page.evaluate(async (templateId: string) => {
    const w = window as unknown as {
      db: {
        cards: { toArray: () => Promise<Array<{ id: number; cardTemplateId: string; status: string }>> };
        quarterlyRewards: { toArray: () => Promise<Array<{ id: number; cardId: number; status: string; category: string }>> };
      };
    };
    const cards = await w.db.cards.toArray();
    const rewards = await w.db.quarterlyRewards.toArray();
    const matchingCard = cards.find(c => c.cardTemplateId === templateId && c.status === 'active');
    return { matchingCard, rewards };
  }, expectedTemplateId);

  expect(result.matchingCard).toBeDefined();
  const cardRewards = result.rewards.filter(r => r.cardId === result.matchingCard?.id);
  expect(cardRewards.length).toBeGreaterThanOrEqual(2);
  expect(cardRewards.some(r => r.status === 'active')).toBe(true);
  expect(cardRewards.some(r => r.status === 'queued')).toBe(true);
});

When('I choose a backup with an invalid quarterly reward', async function () {
  const backup = {
    format: 'credit-card-rewards-backup',
    version: 1,
    exportedAt: '2026-09-04T12:00:00.000Z',
    data: {
      cards: [{
        id: 1,
        cardTemplateId: 'chase-sapphire-preferred',
        openedDate: '2026-01-01',
        annualFeeDate: '2027-01-01',
        status: 'active',
      }],
      signupBonuses: [],
      perks: [],
      quarterlyRewards: [{
        id: 1,
        cardId: 999,
        category: 'Gas',
        multiplier: 5,
        quarter: 3,
        year: 2026,
        status: 'active',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
      }],
    },
  };
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'invalid-reward.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
});

When('I close the data transfer modal', async function () {
  await this.page.getByRole('button', { name: 'Close data transfer' }).click();
  await expect(this.page.getByRole('dialog', { name: 'Export or import data' })).toHaveCount(0);
});

When('I choose a backup with a quarterly reward patch {string} and value {string}', async function (patchKey: string, patchVal: string) {
  let val: unknown = patchVal;
  if (patchKey === 'multiplier' || patchKey === 'year' || patchKey === 'quarter' || patchKey === 'cardId') {
    val = Number(patchVal);
  }
  const backup = {
    format: 'credit-card-rewards-backup',
    version: 1,
    exportedAt: '2026-09-04T12:00:00.000Z',
    data: {
      cards: [{
        id: 1,
        cardTemplateId: 'chase-sapphire-preferred',
        openedDate: '2026-01-01',
        annualFeeDate: '2027-01-01',
        status: 'active',
      }],
      signupBonuses: [],
      perks: [],
      quarterlyRewards: [{
        id: 1,
        cardId: 1,
        category: 'Gas',
        multiplier: 5,
        quarter: 3,
        year: 2026,
        status: 'active',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        [patchKey]: val,
      }],
    },
  };
  await this.page.getByLabel('Choose backup file').setInputFiles({
    name: 'malformed-reward.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
});
