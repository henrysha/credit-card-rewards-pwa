import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see {int} cards in the catalog', async function (count: number) {
  // Catalog page uses the .glass-card selector for card entries
  // There's also the filter tabs — we need to count only the card entries
  // Each card in the catalog list is a .glass-card with cursor: pointer 
  const cards = this.page.locator('.page .glass-card[style*="cursor"]');
  await expect(cards).toHaveCount(count, { timeout: 5000 });
});

When('I click the {string} filter button', async function (issuer: string) {
  await this.page.locator('.tabs .tab').filter({ hasText: issuer }).click();
  await this.page.waitForTimeout(300);
});

When('I search for {string}', async function (query: string) {
  const searchInput = this.page.locator('input[placeholder*="Search"]');
  await searchInput.fill(query);
  await this.page.waitForTimeout(300);
});
