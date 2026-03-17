import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the dashboard', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
  await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

When('I click the settings menu button', async function () {
  const settingsBtn = this.page.getByRole('button', { name: 'Settings' });
  await settingsBtn.click();
});

When('I click the button {string}', async function (buttonText: string) {
  // Try dropdown item or general button
  const button = this.page.getByRole('button', { name: buttonText, exact: true });
  const menuItem = this.page.locator('.dropdown-item').filter({ hasText: buttonText });
  
  if (await menuItem.count() > 0) {
    await menuItem.click();
  } else if (await button.count() > 0) {
    await button.click();
  } else {
    await this.page.getByText(buttonText, { exact: true }).click();
  }
});

Then('I should see the {string} modal', async function (modalTitle: string) {
  const modal = this.page.locator('.modal-content');
  await expect(modal).toBeVisible();
  await expect(modal.getByRole('heading')).toContainText(modalTitle);
});

When('I fill in {string} with {string}', async function (label: string, value: string) {
  // Find the label, then the input next to it, or use placeholder
  const input = this.page.locator('.form-group').filter({ hasText: label }).locator('input, textarea');
  await input.fill(value);
});

Then('the modal should be closed', async function () {
  const modal = this.page.locator('.modal-overlay');
  await expect(modal).not.toBeVisible();
});
