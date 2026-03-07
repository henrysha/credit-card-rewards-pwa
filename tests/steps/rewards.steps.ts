import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see {string} in the best card section with {string} and {string} multiplier', async function (category: string, cardName: string, multiplier: string) {
  // Wait for the best card section to likely be rendered
  await this.page.waitForSelector('.best-card-row', { timeout: 10000 });
  
  // Use data-category attribute for exact matching
  const row = this.page.locator(`.best-card-row[data-category="${category}"]`);
  
  // Explicitly scroll into view to be safe
  await row.scrollIntoViewIfNeeded();
  
  await expect(row).toBeVisible({ timeout: 10000 });
  
  // Verify basic presence of text
  await expect(row).toContainText(category);
  await expect(row).toContainText(cardName);
  
  // Multiplier is in the div with text-gold class
  await expect(row.locator('.text-gold')).toHaveText(multiplier);
});

Then('I should not see {string} in the best card section with {string} and {string} multiplier', async function (category: string, cardName: string, multiplier: string) {
  // We check if a row with this category exists AND matches the card/multiplier
  const rows = this.page.locator('.best-card-row');
  const count = await rows.count();
  
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const catText = await row.locator('div').nth(0).textContent();
    if (catText?.trim() === category) {
      const cardText = await row.locator('div').nth(1).textContent();
      const multText = await row.locator('.text-gold').textContent();
      
      if (cardText?.includes(cardName) && multText?.trim() === multiplier) {
        throw new Error(`Expected not to see "${category}" with "${cardName}" and "${multiplier}", but it was found.`);
      }
    }
  }
});
