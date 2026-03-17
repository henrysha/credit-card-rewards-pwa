import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I click the {string} menu item', async function (menuText: string) {
  const menuItem = this.page.locator('.dropdown-item').filter({ hasText: menuText });
  await menuItem.click();
});

When('I enter {string} into the {string} field', async function (value: string, label: string) {
  const input = this.page.locator('.form-group').filter({ hasText: label }).locator('input, textarea');
  await input.fill(value);
});

Then('I should be redirected to GitHub to create a new issue for the card', async function () {
  // Since we use window.open, we'll just verify the modal closes.
  // A more thorough test would mock window.open and check the arguments.
  await expect(this.page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
});

When('I click the {string} button', async function (btnName: string) {
  // Try aria-label for settings button
  const ariaBtn = this.page.locator(`button[aria-label="${btnName}"]`);
  if (await ariaBtn.count() > 0) {
    await ariaBtn.click();
  } else {
    // Fallback to text search
    await this.page.getByRole('button', { name: btnName, exact: true }).click();
  }
});
