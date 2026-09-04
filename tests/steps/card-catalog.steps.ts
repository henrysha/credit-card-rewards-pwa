import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { cardFamilyLabels } from '../../src/db/card-families';

Then('I should see {int} cards in the catalog', async function (count: number) {
  // Catalog page uses the .glass-card selector for card entries
  // There's also the filter tabs — we need to count only the card entries
  // Each card in the catalog list is a .glass-card with cursor: pointer 
  const cards = this.page.locator('.page .glass-card');
  await expect(cards).toHaveCount(count, { timeout: 5000 });
});

Then('the {string} family should have {int} catalog cards', async function (family: string, count: number) {
  await this.page.getByRole('button', { name: family, exact: true }).click();
  await expect(this.page.locator('.page .glass-card')).toHaveCount(count, { timeout: 5000 });
});

Then('the card family label mappings should exactly cover the catalog family IDs', async function () {
  const catalogFamilyIds = await this.page.evaluate(() => {
    const templates = (window as unknown as { cardTemplates: Array<{ familyId?: string }> }).cardTemplates;
    return [...new Set(templates.map(card => card.familyId).filter((familyId): familyId is string => Boolean(familyId)))];
  });

  expect(Object.keys(cardFamilyLabels).sort()).toEqual(catalogFamilyIds.sort());
});

Then('the card family filters should be labeled {string}', async function (labels: string) {
  const familyFilters = this.page.getByRole('group', { name: 'Card family filters' });
  await expect(familyFilters.getByRole('button')).toHaveText(labels.split(', '));
});

Then('the card family filters should not show slug labels', async function () {
  const familyFilters = this.page.getByRole('group', { name: 'Card family filters' });
  const labels = await familyFilters.getByRole('button').allTextContents();
  expect(labels).not.toContain('chase-ultimate-rewards-consumer');
  expect(labels).not.toContain('chase-united');
  expect(labels).not.toContain('chase-marriott-bonvoy');
  expect(labels).not.toContain('bilt-card-2.0');
  expect(labels).not.toContain('skypass-visa');
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

Then('I should not see {string} perk', async function (perkName: string) {
  const perk = this.page.locator('.perk-info').getByText(perkName, { exact: true });
  await expect(perk).toHaveCount(0, { timeout: 5000 });
});

Then('the {string} perk description should mention {string}', async function (perkName: string, text: string) {
  const perk = this.page.locator('.perk-item').filter({ hasText: perkName }).first();
  await expect(perk.locator('.perk-desc')).toContainText(text, { timeout: 5000 });
});

Then('I should see {string} earning rate with {string}', async function (category: string, multiplier: string) {
  const rate = this.page.locator('.earning-rate').filter({ hasText: category }).first();
  await expect(rate).toBeVisible({ timeout: 5000 });
  await expect(rate.locator('.earning-multiplier')).toHaveText(multiplier);
});

Then('I should not see {string} earning rate', async function (category: string) {
  const rate = this.page.locator('.earning-rate').filter({ hasText: category });
  await expect(rate).toHaveCount(0, { timeout: 5000 });
});

Then('I should see {string} button', async function (buttonText: string) {
  const button = this.page.getByRole('button', { name: buttonText });
  await expect(button).toBeVisible({ timeout: 5000 });
});

Then('the cards {string}, {string}, {string}, and {string} should share a family identifier', async function (first: string, second: string, third: string, fourth: string) {
  const names = [first, second, third, fourth];
  const familyIds = await this.page.evaluate((cardNames: string[]) => {
    const templates = (window as unknown as { cardTemplates: Array<{ name: string; familyId?: string }> }).cardTemplates;
    return cardNames.map(name => templates.find(card => card.name === name)?.familyId);
  }, names);
  expect(familyIds[0]).toBeTruthy();
  expect(new Set(familyIds).size).toBe(1);
});

Then('the cards {string} and {string} should share a family identifier', async function (first: string, second: string) {
  const familyIds = await this.page.evaluate((cardNames: string[]) => {
    const templates = (window as unknown as { cardTemplates: Array<{ name: string; familyId?: string }> }).cardTemplates;
    return cardNames.map(name => templates.find(card => card.name === name)?.familyId);
  }, [first, second]);
  expect(familyIds[0]).toBeTruthy();
  expect(familyIds[0]).toBe(familyIds[1]);
});
