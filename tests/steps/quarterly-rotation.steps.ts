import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { verifyQuarterlyRewards } from '../support/quarterly-rewards-checks';

Given('the rewards date is {string}', async function (date: string) {
  await this.page.clock.setFixedTime(new Date(`${date}T12:00:00`));
});

Then('the quarterly earning rates should show {string}', async function (text: string) {
  await expect(this.page.getByTestId('quarterly-categories')).toContainText(text);
});

Then('no quarterly category schedule should be displayed', async function () {
  await expect(this.page.getByTestId('quarterly-categories')).toHaveCount(0);
});

Then('quarterly reward date boundaries and recommendations should be accurate', function () {
  verifyQuarterlyRewards();
});
