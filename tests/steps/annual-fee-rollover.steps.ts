import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { db } from '../../src/db/database';
import type { UserCard } from '../../src/db/types';

Given('the annual fee calendar uses {string} at {string}', async function (timezoneId: string, instant: string) {
  await this.context.close();
  this.context = await this.browser.newContext({ timezoneId, serviceWorkers: 'block' });
  this.page = await this.context.newPage();
  await this.page.clock.setFixedTime(new Date(instant));
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.waitForLoadState('networkidle');
});

Given('a saved {string} card has annual fee date {string}', async function (status: UserCard['status'], annualFeeDate: string) {
  await this.page.evaluate(async ({ status, annualFeeDate }) => {
    const database = (window as unknown as { db: typeof db }).db;
    await database.cards.add({
      cardTemplateId: 'chase-sapphire-reserve',
      openedDate: '2020-01-01',
      annualFeeDate,
      status,
    });
  }, { status, annualFeeDate });
});

Then('the saved annual fee date should be {string}', async function (expected: string) {
  await expect.poll(async () => this.page.evaluate(async () => {
    const database = (window as unknown as { db: typeof db }).db;
    return (await database.cards.toArray())[0]?.annualFeeDate;
  })).toBe(expected);
});

Then('the next annual fee should display {string}', async function (expected: string) {
  const fee = this.page.locator('.card-tile .text-right');
  await expect(fee).toContainText(expected);
});

Then('the annual fee should have no urgency indicator', async function () {
  await expect(this.page.locator('.card-tile .text-right .text-gold')).toHaveCount(0);
});
