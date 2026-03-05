import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then(/^I should see "([^"]*)" as the 5\/24 count$/, async function (count: string) {
  // The churning page shows the count as a large number + /5 as text-muted
  await expect(this.page.getByText(count, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} issuer section', async function (issuer: string) {
  // Each issuer is rendered as an h3 within a glass-card
  await expect(this.page.locator('h3').filter({ hasText: issuer })).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} for Chase', async function (status: string) {
  // The Chase issuer section is a glass-card that contains "Chase" heading and an "Eligible"/"Ineligible" badge
  const chaseSection = this.page.locator('.glass-card').filter({ hasText: 'Chase' }).first();
  await expect(chaseSection.getByText(status, { exact: false })).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} rule', async function (rule: string) {
  // Rule names are shown in .rule-name elements
  await expect(this.page.getByText(rule, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});
