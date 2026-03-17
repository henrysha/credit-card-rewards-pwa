import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I have added the {string} card with annual fee date in {int} days', async function (cardName: string, days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const feeDateStr = targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

  await this.page.goto(`${this.baseUrl}catalog`);
  await this.page.waitForLoadState('networkidle');

  const card = this.page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.waitFor({ state: 'visible' });
  await card.click();

  // Wait for navigation to the catalog detail page
  await this.page.waitForURL(/\/catalog\/.+/, { timeout: 5000 });

  // Use the test attribute to set the date
  const addBtn = this.page.getByRole('button', { name: 'Add This Card' }).first();
  await addBtn.evaluate((el: HTMLElement, date: string) => el.setAttribute('data-test-date', date), feeDateStr);
  await addBtn.click();
  
  // Wait for redirect back to cards or the new card detail page
  await this.page.waitForURL(/(\/cards|\/card\/\d+)/, { timeout: 10000 });
  await this.page.waitForTimeout(500);
});

When('I navigate to the detail page for {string}', async function (cardName: string) {
  await this.page.goto(`${this.baseUrl}cards`);
  await this.page.waitForLoadState('networkidle');
  
  // Find the card tile in the list and click it
  const cardTile = this.page.locator('.card-tile').filter({ hasText: cardName }).first();
  await cardTile.click();
  
  // Wait for the detail page URL
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
  // On the card detail page, the edit button is typically an icon button near the header or details
  const editBtn = this.page.locator('button[aria-label="Edit card details"], button:has(svg)').first();
  await editBtn.click();
  await this.page.waitForSelector('.modal-overlay', { state: 'visible' });
});

When('I change the annual fee date to {int} days from now', async function (days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  this._updatedFeeDate = targetDate.toLocaleDateString('en-US');

  const feeDateInput = this.page.locator('.form-group', { hasText: 'Next Annual Fee Date' }).locator('input[type="date"]');
  await feeDateInput.waitFor({ state: 'visible', timeout: 5000 });
  await feeDateInput.fill(this._updatedFeeDate);
});

Then('I should see the annual fee date updated to {int} days from now', async function (days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const expectedDate = targetDate.toLocaleDateString('en-US');
  await expect(this.page.getByText(expectedDate)).toBeVisible();
});
