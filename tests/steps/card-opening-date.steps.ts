import { Given, When, Then } from '@cucumber/cucumber';
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

When('I enter today as the card opening date', async function () {
  const today = await this.page.evaluate(() => new Date().toISOString().split('T')[0]);
  await this.page.getByLabel('Opening Date', { exact: true }).fill(today);
});

Then('the opening date input should be invalid', async function () {
  const input = this.page.getByLabel('Opening Date', { exact: true });
  expect(await input.evaluate((el: HTMLInputElement) => el.validity.rangeOverflow)).toBe(true);
});

When('I open the bonus deadline editor', async function () {
  await this.page.getByRole('button', { name: 'Edit sign-up bonus', exact: true }).click();
  await expect(this.page.getByRole('heading', { name: 'Edit Sign-up Bonus', exact: true })).toBeVisible();
});

When('I enter {string} as the bonus deadline', async function (date: string) {
  await this.page.locator('.modal-content input[type="date"]').fill(date);
});

Then('the bonus deadline input should contain {string}', async function (date: string) {
  await expect(this.page.locator('.modal-content input[type="date"]')).toHaveValue(date);
});

Then('the bonus countdown should show expired', async function () {
  await expect(this.page.locator('.countdown')).toHaveText('Expired');
});

Given('the card has a legacy generated bonus deadline', async function () {
  const cardId = Number(this.page.url().match(/\/card\/(\d+)/)?.[1]);
  await this.page.evaluate(async (id: number) => {
    const { db } = window as unknown as { db: typeof import('../../src/db/database').db };
    const openedDate = '2020-02-29';
    const deadline = new Date(openedDate);
    deadline.setMonth(deadline.getMonth() + 3);
    await db.cards.update(id, { openedDate });
    await db.signupBonuses.where('cardId').equals(id).modify({ deadline: deadline.toISOString().split('T')[0] });
  }, cardId);
  await this.page.reload();
  await expect(this.page.locator('.card-opened-date')).toHaveText('2020-02-29');
});
