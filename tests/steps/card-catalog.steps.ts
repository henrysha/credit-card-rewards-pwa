import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see {int} cards in the catalog', async function (count: number) {
  // Catalog page uses the .glass-card selector for card entries
  // There's also the filter tabs — we need to count only the card entries
  // Each card in the catalog list is a .glass-card with cursor: pointer 
  const cards = this.page.locator('.page .glass-card');
  await expect(cards).toHaveCount(count, { timeout: 5000 });
});

When('I click the {string} filter button', async function (issuer: string) {
  const tabName = issuer === 'all' ? 'All' : issuer;
  await this.page.getByRole('button', { name: tabName, exact: true }).click();
  await this.page.waitForTimeout(300);
});

When('I search for {string}', async function (query: string) {
  const searchInput = this.page.getByPlaceholder('Search cards...');
  await searchInput.fill(query);
  await this.page.waitForTimeout(300);
});

When('I click on the card {string}', async function (cardName: string) {
  const card = this.page.locator('.glass-card').filter({ hasText: cardName }).first();
  await card.click();
  await this.page.waitForTimeout(500); // Give it a moment to navigate
});

Then('I should see {string} perk', async function (perkName: string) {
  const perk = this.page.locator('.perk-info').getByText(perkName, { exact: true });
  await expect(perk).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} button', async function (buttonText: string) {
  const button = this.page.getByRole('button', { name: buttonText });
  await expect(button).toBeVisible({ timeout: 5000 });
});
