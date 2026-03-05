import { Given, When, Then } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

// Helper to add a card through the UI
async function addCardViaUI(page: Page, cardName: string) {
  await page.goto(`${BASE_URL}/catalog`);
  await page.waitForLoadState('networkidle');

  // Click the card in the catalog (cards are glass-card with cursor pointer)
  const card = page.locator('.glass-card[style*="cursor"]').filter({ hasText: cardName });
  await card.click();

  // Wait for modal to appear
  await page.waitForSelector('.modal-overlay', { state: 'visible' });

  // Click "Add Card" button  
  await page.locator('.modal-content button').filter({ hasText: /Add Card|Adding/ }).click();

  // Wait for navigation to card detail or back to cards
  await page.waitForTimeout(1000);
}

Given('I have added the {string} card', async function (cardName: string) {
  await addCardViaUI(this.page, cardName);
});

When('I click on the {string} card in the catalog', async function (cardName: string) {
  const card = this.page.locator('.glass-card[style*="cursor"]').filter({ hasText: cardName });
  await card.click();
});

Then('I should see the add card modal', async function () {
  await expect(this.page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });
});

When('I add the {string} card', async function (cardName: string) {
  const card = this.page.locator('.glass-card[style*="cursor"]').filter({ hasText: cardName });
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
  await this.page.goto(`${BASE_URL}/cards`);
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
  await this.page.locator('button').filter({ hasText: buttonText }).click();
  await this.page.waitForTimeout(300);
});

When('I confirm the removal', async function () {
  // The remove modal has a "Remove" button with btn-danger class
  const confirmBtn = this.page.locator('.modal-content button.btn-danger').filter({ hasText: 'Remove' });
  await confirmBtn.click();
  await this.page.waitForTimeout(500);
});

Then('I should be on the cards page', async function () {
  await this.page.waitForURL(/\/cards/, { timeout: 5000 });
});
