import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see the product change modal', async function () {
  await this.page.waitForSelector('.modal-overlay', { state: 'visible', timeout: 5000 });
  const heading = this.page.locator('.modal-content').getByText(/Product Change/i).first();
  await expect(heading).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} in the product change options', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName }).first();
  await expect(option).toBeVisible({ timeout: 5000 });
});

Then('I should not see {string} in the product change options', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName });
  await expect(option).toHaveCount(0);
});

When('I select {string} for product change', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName }).first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.scrollIntoViewIfNeeded();
  await option.click();
});

When('I confirm the product change', async function () {
  const confirmBtn = this.page.locator('.modal-content button.btn-primary').filter({ hasText: /Confirm/i }).first();
  await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmBtn.click();
  await this.page.waitForURL(/\/card\/\d+/, { timeout: 8000 });
  await this.page.waitForTimeout(500);
});

Then('I should see {string} in the closed cards section', async function (statusText: string) {
  const badge = this.page.locator('.badge-red').filter({ hasText: statusText }).first();
  await expect(badge).toBeVisible({ timeout: 5000 });
});
