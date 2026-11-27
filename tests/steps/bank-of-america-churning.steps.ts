import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { db } from '../../src/db/database';

Given('the churning date is {string}', async function (date: string) {
  await this.page.clock.setFixedTime(new Date(`${date}T12:00:00`));
});

Given('my card history includes an Atmos Ascent opened {string} and closed {string}', async function (openedDate: string, closed: string) {
  await this.page.evaluate(async ({ openedDate, closed }) => {
    const database = (window as unknown as { db: typeof db }).db;
    await database.cards.add({
      cardTemplateId: 'boa-atmos-ascent',
      openedDate,
      annualFeeDate: '2026-12-31',
      status: closed === 'still active' ? 'active' : 'closed',
      closedDate: /^\d/.test(closed) ? closed : undefined,
    });
  }, { openedDate, closed });
});

Then('I should see {string} for Bank of America', async function (text: string) {
  const section = this.page.getByRole('region', { name: 'Bank of America' });
  await expect(section.getByText(text, { exact: text !== '2/3/4' }).first()).toBeVisible();
});

Then('the Bank of America section should link to the three issuer offers and the reported approval limits', async function () {
  const section = this.page.getByRole('region', { name: 'Bank of America' });
  const offerLinks = section.getByRole('link', { name: 'View Bank of America offer terms' });
  await expect(offerLinks).toHaveCount(3);
  const urls = [
    'https://www.bankofamerica.com/credit-cards/terms-and-conditions/?campaignid=4081060&productoffercode=RS&locale=en_US',
    'https://www.bankofamerica.com/credit-cards/terms-and-conditions/?campaignid=4081112&productoffercode=S2&locale=en_US',
    'https://www.bankofamerica.com/smallbusiness/credit-cards/terms-and-conditions/?campaignid=4082063&productoffercode=K8&locale=en_US',
  ];
  for (const [index, url] of urls.entries()) {
    await expect(offerLinks.nth(index)).toHaveAttribute('href', url);
  }
  await expect(section.getByRole('link', { name: 'Read the reported approval limits' }))
    .toHaveAttribute('href', 'https://onemileatatime.com/guides/atmos-rewards-summit-card-application-approval/');
});

When('I open the Mark Closed dialog', async function () {
  await this.page.getByRole('button', { name: 'Mark Closed', exact: true }).click();
  await expect(this.page.getByRole('dialog', { name: 'Mark Card Closed' })).toBeVisible();
});

When('I enter {string} as the closure date', async function (date: string) {
  await this.page.getByLabel('Closure date').fill(date);
});

Then('saving the closure date should be disabled', async function () {
  const dialog = this.page.getByRole('dialog', { name: 'Mark Card Closed' });
  await expect(dialog.getByRole('button', { name: 'Mark Closed' })).toBeDisabled();
});

When('I confirm marking the card closed', async function () {
  const dialog = this.page.getByRole('dialog', { name: 'Mark Card Closed' });
  await dialog.getByRole('button', { name: 'Mark Closed' }).click();
});

Then("the card's bonus and perks should still be in wallet history", async function () {
  await expect(this.page.getByText('Sign-up Bonus', { exact: true })).toBeVisible();
  await expect(this.page.getByText('$100 Alaska Lounge+ Discount', { exact: true })).toBeVisible();
  await expect(this.page.getByRole('button', { name: 'Update Spend' })).toHaveCount(0);
});

Then('the dashboard should show no active bonus or perk tracking', async function () {
  await expect(this.page.getByText('Active Sign-up Bonuses', { exact: true })).toHaveCount(0);
  await expect(this.page.getByText('Unused Perks This Period', { exact: true })).toHaveCount(0);
});
