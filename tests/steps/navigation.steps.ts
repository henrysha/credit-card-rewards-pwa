import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

const NAV_MAP: Record<string, string> = {
  'Dashboard': '/',
  'Home': '/',
  'Cards': '/cards',
  'Perks': '/perks',
  'Churning': '/churning',
  'Catalog': '/catalog',
};

Given('I open the app', async function () {
  await this.page.goto(BASE_URL);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the {string} page', async function (pageName: string) {
  const path = NAV_MAP[pageName] || '/';
  await this.page.goto(`${BASE_URL}${path}`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the {string}', async function (pageName: string) {
  // Use bottom nav link
  const navLink = this.page.locator(`nav a`).filter({ hasText: pageName === 'Dashboard' ? 'Home' : pageName });
  await navLink.click();
  await this.page.waitForLoadState('networkidle');
});

Then('I should see {string}', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should not see {string}', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false })).toHaveCount(0, { timeout: 5000 });
});
