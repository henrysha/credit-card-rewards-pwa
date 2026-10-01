import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { db } from '../../src/db/database';
import type { CardTemplate, RenewalPeriod } from '../../src/db/types';

interface PerkTestWindow {
  db: typeof db;
  cardTemplates: CardTemplate[];
}

Given('the perk calendar uses {string} at {string}', async function (timezoneId: string, instant: string) {
  await this.context.close();
  this.context = await this.browser.newContext({ timezoneId, serviceWorkers: 'block' });
  this.page = await this.context.newPage();
  await this.page.clock.setFixedTime(new Date(instant));
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.waitForLoadState('networkidle');
});

When('I open the Reserve catalog benefits', async function () {
  await this.page.goto(`${this.baseUrl}catalog/chase-sapphire-reserve`);
  await this.page.waitForLoadState('networkidle');
});

When('the perk clock moves to {string} without lifecycle cleanup', async function (instant: string) {
  await this.page.clock.setFixedTime(new Date(instant));
});

When('the perk calendar advances to {string}', async function (instant: string) {
  await this.page.clock.setFixedTime(new Date(instant));
  await this.page.evaluate(() => window.dispatchEvent(new Event('mockdatechange')));
});

Given('the select hotel perk has renewal {string} and period end {string}', async function (renewalPeriod: RenewalPeriod, currentPeriodEnd: string) {
  await this.page.evaluate(async ({ renewalPeriod, currentPeriodEnd }) => {
    const { db, cardTemplates } = window as unknown as PerkTestWindow;
    const template = cardTemplates.find(c => c.id === 'chase-sapphire-reserve')!;
    template.perks.find(p => p.id === 'csr-select-hotel')!.renewalPeriod = renewalPeriod;
    const perk = (await db.perks.toArray()).find(p => p.perkTemplateId === 'csr-select-hotel')!;
    await db.perks.update(perk.id!, { renewalPeriod, currentPeriodEnd });
  }, { renewalPeriod, currentPeriodEnd });
});

Then('the saved {string} perk count should be {int}', async function (id: string, count: number) {
  await expect.poll(() => this.page.evaluate(async (id: string) => {
    const { db } = window as unknown as PerkTestWindow;
    return (await db.perks.toArray()).filter(p => p.perkTemplateId === id).length;
  }, id)).toBe(count);
});

Then('the unclaimed perk badge should be {int} dollars', async function (value: number) {
  await expect(this.page.getByText(`$${value} unclaimed`, { exact: true })).toBeVisible();
});

Then('the dashboard unused perk value should be {int} dollars', async function (value: number) {
  const stat = this.page.locator('.stat-card').filter({ hasText: 'Unused Perks Value' });
  await expect(stat.locator('.stat-value')).toHaveText(`$${value}`);
});

When('I open the saved Reserve benefits without reloading', async function () {
  // React navigation avoids the initial lifecycle refresh and exercises stale records.
  await this.page.getByRole('link', { name: 'Cards', exact: true }).click();
  await this.page.locator('.card-tile').filter({ hasText: 'Chase Sapphire Reserve' }).click();
});

Then('the saved select hotel history should still be used on {string}', async function (usedDate: string) {
  const history = await this.page.evaluate(async () => {
    const { db } = window as unknown as PerkTestWindow;
    return (await db.perks.toArray()).filter(p => p.perkTemplateId === 'csr-select-hotel');
  });
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ used: true, usedDate, currentPeriodEnd: '2026-12-31', annualValue: 250 });
});

Then('the Reserve preview should include the select hotel credit', async function () {
  const card = this.page.locator('.glass-card').filter({ hasText: 'Chase Sapphire Reserve' });
  await expect(card.getByText('$250 Select Hotel Credit', { exact: true })).toBeVisible();
});

Then('the Reserve preview should exclude the select hotel credit', async function () {
  const card = this.page.locator('.glass-card').filter({ hasText: 'Chase Sapphire Reserve' });
  await expect(card.getByText('$250 Select Hotel Credit', { exact: true })).toHaveCount(0);
  await expect(card.getByText('$300 Exclusive Tables Dining', { exact: true })).toBeVisible();
});

Then('the Reserve product change preview should show {int} perks', async function (count: number) {
  const card = this.page.locator('.modal-content .glass-card').filter({ hasText: 'Chase Sapphire Reserve' });
  await expect(card).toContainText(`${count} perks`);
  await expect(card.getByText('+10 more', { exact: true })).toBeVisible();
});
