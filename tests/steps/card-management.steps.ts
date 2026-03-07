import { Given, When, Then } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';

// Helper to add a card through the UI
async function addCardViaUI(page: Page, cardName: string, baseUrl: string) {
  await page.goto(`${baseUrl}catalog`);
  await page.waitForLoadState('networkidle');

  // Loosen the card selector for production build robustness
  const card = page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.waitFor({ state: 'visible', timeout: 5000 });
  await card.click();

  // Wait for modal to appear
  await page.waitForSelector('.modal-overlay', { state: 'visible' });

  // Click "Add Card" button  
  await page.locator('.modal-content button').filter({ hasText: /Add Card|Adding/ }).click();

  // Wait for navigation to card detail or back to cards
  await page.waitForTimeout(1000);
}

Given('I have added the {string} card', async function (cardName: string) {
  await addCardViaUI(this.page, cardName, this.baseUrl);
});

When('I click on the {string} card in the catalog', async function (cardName: string) {
  const card = this.page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.click();
});

Then('I should see the add card modal', async function () {
  await expect(this.page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });
});

When('I add the {string} card', async function (cardName: string) {
  const card = this.page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.click();
  await this.page.waitForSelector('.modal-overlay', { state: 'visible' });
  await this.page.locator('.modal-content button').filter({ hasText: /Add Card|Adding/ }).click();
  await this.page.waitForTimeout(1000);
});

Then('I should see {string} on the cards page', async function (cardName: string) {
  await expect(this.page.getByText(cardName, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

When('I view the card detail for {string}', async function (cardName: string) {
  // Navigate to My Cards page
  await this.page.goto(`${this.baseUrl}cards`);
  await this.page.waitForLoadState('networkidle');

  // Click the card tile
  const card = this.page.locator('.card-tile').filter({ hasText: cardName });
  await card.click();
  await this.page.waitForURL(/\/card\/\d+/, { timeout: 5000 });
});

Then('I should see {string} on the detail page', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} in the perks list', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

// Remove card steps
When('I click {string}', async function (buttonText: string) {
  const btn = this.page.locator('button').filter({ hasText: buttonText }).first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
});

When('I confirm the removal', async function () {
  // Wait for modal to appear
  await this.page.waitForSelector('.modal-overlay', { state: 'visible', timeout: 5000 });
  
  // The remove modal has a "Remove" button with btn-danger class
  // Use first() to be safe and ensure visibility before click
  const confirmBtn = this.page.locator('.modal-content button.btn-danger').filter({ hasText: 'Remove' }).first();
  await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmBtn.click();
});

Then('I should be on the cards page', async function () {
  await this.page.waitForURL(/\/cards/, { timeout: 5000 });
});
