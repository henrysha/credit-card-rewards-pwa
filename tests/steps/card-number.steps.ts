import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I enter {string} as the saved card number', async function (digits: string) {
  await this.page.getByLabel('Last 4 Digits', { exact: true }).fill(digits);
});

Then('the saved card number input should contain {string}', async function (digits: string) {
  await expect(this.page.getByLabel('Last 4 Digits', { exact: true })).toHaveValue(digits);
});

Then('the card should display saved number {string}', async function (digits: string) {
  await expect(this.page.locator('.modal-overlay')).toHaveCount(0);
  await expect(this.page.locator('.card-tile .card-last-four')).toHaveText(`•••• ${digits}`);
});

Then('saving the card number should be disabled', async function () {
  await expect(this.page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
});

Then('saving the card number should be enabled', async function () {
  await expect(this.page.getByRole('button', { name: 'Save Changes', exact: true })).toBeEnabled();
});
