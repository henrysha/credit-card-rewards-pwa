import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I check bonus eligibility for {string}', async function (cardName: string) {
  const result = await this.page.evaluate(async (name: string) => {
    const templates = (window as unknown as { cardTemplates: Array<{ id: string; name: string }> }).cardTemplates;
    const template = templates.find(t => t.name === name);
    if (!template) throw new Error(`Template not found: ${name}`);
    return (window as unknown as { getSignupBonusEligibility: (id: string) => Promise<{ eligible: boolean; history: Array<{ cardTemplateId: string }> }> }).getSignupBonusEligibility(template.id);
  }, cardName);
  (this as unknown as { bonusEligibility: typeof result }).bonusEligibility = result;
});

Then('the SKYPASS bonus should be marked ineligible', async function () {
  expect((this as unknown as { bonusEligibility: { eligible: boolean } }).bonusEligibility.eligible).toBe(false);
});

Then('the SKYPASS family history should include {string}', async function (cardName: string) {
  const result = (this as unknown as { bonusEligibility: { history: Array<{ cardTemplateId: string }> } }).bonusEligibility;
  const names = await this.page.evaluate((history: Array<{ cardTemplateId: string }>) => {
    const templates = (window as unknown as { cardTemplates: Array<{ id: string; name: string }> }).cardTemplates;
    return history.map(card => templates.find(t => t.id === card.cardTemplateId)?.name);
  }, result.history);
  expect(names).toContain(cardName);
});

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

Then('I should see {string} for U.S. Bank', async function (status: string) {
  const bankSection = this.page.locator('.glass-card').filter({ hasText: 'U.S. Bank' }).first();
  await expect(bankSection.getByText(status, { exact: true })).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} rule', async function (rule: string) {
  // Rule names are shown in .rule-name elements
  await expect(this.page.getByText(rule, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});
