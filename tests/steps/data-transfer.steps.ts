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
  this.downloadedBackup = await (await download.createReadStream()).toArray().then((chunks: Buffer[]) => Buffer.concat(chunks).toString());
});

Then('the downloaded JSON backup should contain {string}', async function (templateId: string) {
  const backup = JSON.parse(this.downloadedBackup);
  expect(backup.format).toBe('credit-card-rewards-backup');
  expect(backup.data.cards.some((card: { cardTemplateId: string }) => card.cardTemplateId === templateId)).toBe(true);
  expect(backup.data.signupBonuses.length).toBeGreaterThan(0);
  expect(backup.data.perks.length).toBeGreaterThan(0);
});

When('I export a CSV backup', async function () {
  const downloadPromise = this.page.waitForEvent('download');
  await this.page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  this.downloadedBackup = await (await download.createReadStream()).toArray().then((chunks: Buffer[]) => Buffer.concat(chunks).toString());
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
