import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const applicationUrlPattern = /\/credit-card-rewards-pwa\/$/;

Given('native application sharing is available', async function () {
  await this.page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        (window as typeof window & { sharedApplication?: ShareData }).sharedApplication = data;
      },
    });
  });
});

Given('native application sharing is unavailable', async function () {
  await this.page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
  });
});

Then('the application link should be shared', async function () {
  const shareData = await this.page.evaluate(() => (
    window as typeof window & { sharedApplication?: ShareData }
  ).sharedApplication);

  expect(shareData?.title).toBe('Credit Card Rewards Tracker');
  expect(shareData?.url).toMatch(applicationUrlPattern);
});

Then('the application link should be copied', async function () {
  const copiedUrl = await this.page.evaluate(() => navigator.clipboard.readText());
  expect(copiedUrl).toMatch(applicationUrlPattern);
});

Then('I should see the toast {string}', async function (message: string) {
  await expect(this.page.locator('.toast')).toHaveText(message);
});

Then('the settings menu should be closed', async function () {
  await expect(this.page.getByRole('button', { name: 'Share App' })).not.toBeVisible();
});
