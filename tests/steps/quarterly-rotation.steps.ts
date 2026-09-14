import { Given, Then, When } from '@cucumber/cucumber';
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

When('the PWA resumes on {string}', async function (date: string) {
  await this.page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await this.page.clock.setFixedTime(new Date(`${date}T12:00:00`));
  await this.page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
});

Given('the rewards clock starts just before the quarter ends', async function () {
  const time = new Date('2026-09-30T23:59:00');
  await this.page.clock.install({ time });
  // Keep timers running while Dexie and React finish rendering the card.
  // Pausing here also freezes their scheduled work before the first assertion.
});

When('the rewards clock passes midnight', async function () {
  await this.page.clock.fastForward(61_000);
});
