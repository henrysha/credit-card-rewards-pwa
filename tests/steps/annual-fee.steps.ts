import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I have added the {string} card with annual fee date in {int} days', async function (cardName: string, days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const feeDateStr = targetDate.toISOString().split('T')[0];

  await this.page.goto(`${this.baseUrl}catalog`);
  await this.page.waitForLoadState('networkidle');

  const card = this.page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.waitFor({ state: 'visible' });
  await card.click();

  await this.page.waitForSelector('.modal-overlay', { state: 'visible' });

  // Find the annual fee date input by its label
  const feeDateInput = this.page.locator('.form-group', { hasText: 'Next Annual Fee Date' }).locator('input[type="date"]');
  await feeDateInput.waitFor({ state: 'visible', timeout: 5000 });
  await feeDateInput.fill(feeDateStr);

  await this.page.locator('.modal-content button').filter({ hasText: /Add Card|Adding/ }).click();
  await this.page.waitForSelector('.modal-overlay', { state: 'hidden' });
  await this.page.waitForTimeout(500);
});

When('I navigate to the detail page for {string}', async function (cardName: string) {
  await this.page.goto(`${this.baseUrl}cards`);
  await this.page.waitForLoadState('networkidle');
  const card = this.page.locator('.card-tile').filter({ hasText: cardName });
  await card.click();
  await this.page.waitForURL(/\/card\/\d+/, { timeout: 5000 });
});

Then('I should see the annual fee date displayed', async function () {
  const feeInfo = this.page.getByText('Next Annual Fee');
  await expect(feeInfo).toBeVisible();
});

Then('I should see an urgency indicator for the annual fee', async function () {
  // The urgency indicator is the 'text-gold' class
  const urgencyLabel = this.page.locator('.text-gold').filter({ hasText: /202\d-\d\d-\d\d/ });
  await expect(urgencyLabel).toBeVisible();
});

When('I click the edit icon next to the annual fee date', async function () {
  const editBtn = this.page.locator('.card-tile button[aria-label="Edit card details"], .card-tile button svg').first();
  // The edit button is next to the annual fee date row
  await editBtn.click();
  await this.page.waitForSelector('.modal-overlay', { state: 'visible' });
});

When('I change the annual fee date to {int} days from now', async function (days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  this._updatedFeeDate = targetDate.toISOString().split('T')[0];

  const feeDateInput = this.page.locator('.form-group', { hasText: 'Next Annual Fee Date' }).locator('input[type="date"]');
  await feeDateInput.waitFor({ state: 'visible', timeout: 5000 });
  await feeDateInput.fill(this._updatedFeeDate);
});

Then('I should see the annual fee date updated to {int} days from now', async function (days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const expectedDate = targetDate.toISOString().split('T')[0];
  await expect(this.page.getByText(expectedDate)).toBeVisible();
});
