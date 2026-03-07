import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see {string} as the active cards count', async function (count: string) {
  // The stat card with "Active Cards" label  
  const statCard = this.page.locator('.stat-card').filter({ hasText: 'Active Cards' });
  await expect(statCard.locator('.stat-value')).toHaveText(count);
});

Then('I should see {string} as the unused perks value', async function (value: string) {
  const statCard = this.page.locator('.stat-card').filter({ hasText: 'Unused Perks Value' });
  await expect(statCard.locator('.stat-value')).toHaveText(value);
});

Then('the unused perks value should be greater than {string}', async function (minValue: string) {
  const statCard = this.page.locator('.stat-card').filter({ hasText: 'Unused Perks Value' });
  const statValue = statCard.locator('.stat-value');
  
  // Wait for the value to be greater than $0
  await expect(async () => {
    const text = await statValue.textContent();
    const numericValue = parseInt(text!.replace(/[^0-9]/g, ''), 10);
    const min = parseInt(minValue.replace(/[^0-9]/g, ''), 10);
    expect(numericValue).toBeGreaterThan(min);
  }).toPass({ timeout: 10000 });
});

Then('I should see {string} on the dashboard', async function (text: string) {
  // Wait a bit longer for Dexie live queries to load data and render
  await this.page.waitForTimeout(1000);
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} bonus info', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

interface CustomWorld {
  page: import('@playwright/test').Page;
}

When('I click to expand the {string} category', async function (this: CustomWorld, category: string) {
  const row = this.page.locator(`div[data-category="${category}"]`).first();
  await expect(row).toBeVisible({ timeout: 5000 });
  await row.click();
});

Then('I should see the {string} subcategory', async function (this: CustomWorld, subcategory: string) {
  const row = this.page.locator(`div[data-category="${subcategory}"]`).first();
  await expect(row).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} as the recommended card for {string}', async function (this: CustomWorld, cardName: string, category: string) {
  const row = this.page.locator(`div[data-category="${category}"]`).first();
  await expect(row).toContainText(cardName);
});
