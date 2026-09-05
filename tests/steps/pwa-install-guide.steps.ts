import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const userAgents = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/128.0.0.0 Mobile Safari/537.36',
  desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
};

async function useUserAgent(page: import('@playwright/test').Page, userAgent: string) {
  await page.addInitScript((value) => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value });
  }, userAgent);
}

Given('I am browsing on an iPhone', async function () {
  await useUserAgent(this.page, userAgents.ios);
});

Given('I am browsing on Android', async function () {
  await useUserAgent(this.page, userAgents.android);
});

Given('I am browsing on a desktop computer', async function () {
  await useUserAgent(this.page, userAgents.desktop);
});

Given('the application is running as an installed PWA', async function () {
  await this.page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => query === '(display-mode: standalone)'
      ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true }
      : originalMatchMedia(query);
  });
});

When('I load the application in the browser', async function () {
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

Then('I should see the PWA installation guide', async function () {
  await expect(this.page.getByRole('dialog', { name: 'Install the app' })).toBeVisible();
});

Then('I should not see the PWA installation guide', async function () {
  await expect(this.page.getByRole('dialog', { name: 'Install the app' })).not.toBeVisible();
});

Then('I should see the iOS installation instructions', async function () {
  await expect(this.page.getByText('Tap the Share button in Safari.')).toBeVisible();
  await expect(this.page.getByText('Add to Home Screen', { exact: false })).toBeVisible();
});

Then('I should see the Android installation instructions', async function () {
  await expect(this.page.getByText('Open your browser menu (⋮).')).toBeVisible();
  await expect(this.page.getByText('Install app', { exact: false })).toBeVisible();
});
