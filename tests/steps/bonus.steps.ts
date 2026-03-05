import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see {string} spend progress', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should see a days remaining countdown', async function () {
  // The bonus area shows "{X}d left" via the countdown class
  await expect(this.page.locator('.countdown')).toBeVisible({ timeout: 5000 });
});

When('I update the bonus spend to {int}', async function (amount: number) {
  // Click "Update Spend" button to toggle to edit mode
  const updateBtn = this.page.locator('button').filter({ hasText: 'Update Spend' });
  await updateBtn.click();
  await this.page.waitForTimeout(300);

  // Fill in the input field that appeared
  const spendInput = this.page.locator('input[type="number"]');
  await spendInput.fill(String(amount));

  // Click "Save" button
  await this.page.locator('button').filter({ hasText: 'Save' }).click();
  await this.page.waitForTimeout(500);
});

Then('I should see the bonus marked as complete', async function () {
  // When bonus is complete, it shows "Bonus Earned!" text
  await expect(this.page.getByText('Bonus Earned!', { exact: false })).toBeVisible({ timeout: 5000 });
});
