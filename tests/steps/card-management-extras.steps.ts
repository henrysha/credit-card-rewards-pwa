import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see the {string} card tile', async function (cardName: string) {
  const cardTile = this.page.locator('.card-tile').filter({ hasText: cardName }).first();
  await expect(cardTile).toBeVisible({ timeout: 5000 });
});

Then('the card tile should not have {string} class', async function (className: string) {
  const cardTile = this.page.locator('.card-tile').first();
  // Wait a bit for state to propagate
  await this.page.waitForTimeout(500);
  const classes = await cardTile.evaluate((el: HTMLElement) => Array.from(el.classList));
  expect(classes).not.toContain(className);
});

When('I open the settings menu', async function () {
  const settingsBtn = this.page.locator('button[aria-label="Settings"]').first();
  await settingsBtn.click();
  await expect(this.page.locator('.dropdown-menu')).toBeVisible({ timeout: 5000 });
});

When('I toggle {string}', async function (toggleLabel: string) {
  const toggleRow = this.page.locator('.dropdown-item').filter({ hasText: toggleLabel }).first();
  const checkbox = toggleRow.locator('input[type="checkbox"]');
  await checkbox.click();
  // Close menu by clicking outside if needed, but for toggle we might just leave it or click again
  // Actually, clicking the checkbox should work. Let's click the toggle row to be sure.
});

Then('the card tile should have {string} class', async function (className: string) {
  const cardTile = this.page.locator('.card-tile').first();
  // Wait a bit for state to propagate
  await this.page.waitForTimeout(500);
  const classes = await cardTile.evaluate((el: HTMLElement) => Array.from(el.classList));
  expect(classes).toContain(className);
});

When('I click the Copy card list button', async function () {
  const btn = this.page.locator('button[title="Copy card list to clipboard"]').first();
  await btn.click();
});


Then('I should see a toast {string}', async function (message: string) {
  const toast = this.page.locator('.toast').filter({ hasText: message }).first();
  await expect(toast).toBeVisible({ timeout: 5000 });
});
