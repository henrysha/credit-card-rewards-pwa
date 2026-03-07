import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const NAV_MAP: Record<string, string> = {
  'Dashboard': '/',
  'Home': '/',
  'Cards': '/cards',
  'Perks': '/perks',
  'Churning': '/churning',
  'Catalog': '/catalog',
};

Given('I open the app', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the {string} page', async function (pageName: string) {
  const pathPart = NAV_MAP[pageName] || '';
  const cleanPath = pathPart.startsWith('/') ? pathPart.substring(1) : pathPart;
  await this.page.goto(`${this.baseUrl}${cleanPath}`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the {string}', async function (pageName: string) {
  // Use bottom nav link
  const navLink = this.page.getByRole('link', { name: pageName === 'Dashboard' ? 'Home' : pageName });
  await navLink.click();
  await this.page.waitForLoadState('networkidle');
});

Then('I should see {string}', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should not see {string}', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false })).toHaveCount(0, { timeout: 5000 });
});
