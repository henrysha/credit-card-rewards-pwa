import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('the card should display its original opening date', async function () {
  this.originalOpeningDate ??= await this.page.locator('.card-opened-date').textContent();
  await expect(this.page.locator('.card-opened-date')).toHaveText(this.originalOpeningDate);
  expect(this.originalOpeningDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

When('I enter {string} as the card opening date', async function (date: string) {
  await this.page.getByLabel('Opening Date', { exact: true }).fill(date);
});

Then('the opening date input should contain the original opening date', async function () {
  await expect(this.page.getByLabel('Opening Date', { exact: true })).toHaveValue(this.originalOpeningDate);
  this.originalAnnualFeeDate ??= await this.page.getByLabel('Next Annual Fee Date', { exact: true }).inputValue();
});

Then('the opening date input should contain {string}', async function (date: string) {
  await expect(this.page.getByLabel('Opening Date', { exact: true })).toHaveValue(date);
});

Then('the card should display opening date {string}', async function (date: string) {
  await expect(this.page.locator('.modal-overlay')).toHaveCount(0);
  await expect(this.page.locator('.card-opened-date')).toHaveText(date);
});

Then('the annual fee date input should still contain the original annual fee date', async function () {
  await expect(this.page.getByLabel('Next Annual Fee Date', { exact: true })).toHaveValue(this.originalAnnualFeeDate);
});

Then('saving the opening date should be disabled', async function () {
  await expect(this.page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
});

Then('saving the opening date should be enabled', async function () {
  await expect(this.page.getByRole('button', { name: 'Save Changes', exact: true })).toBeEnabled();
});
