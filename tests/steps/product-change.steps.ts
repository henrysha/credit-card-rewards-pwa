import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface ProductChangeTestWindow {
  cardTemplates: Array<{ name: string; id: string }>;
  productChangeCard: (cardId: number, targetTemplateId: string) => Promise<number>;
  db: { cards: { toArray: () => Promise<Array<{ id?: number; cardTemplateId: string; status: string; openedDate?: string }>> } };
}

Then('I should see the product change modal', async function () {
  await this.page.waitForSelector('.modal-overlay', { state: 'visible', timeout: 5000 });
  const heading = this.page.locator('.modal-content').getByText(/Product Change/i).first();
  await expect(heading).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} in the product change options', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName }).first();
  await expect(option).toBeVisible({ timeout: 5000 });
});

Then('I should not see {string} in the product change options', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName });
  await expect(option).toHaveCount(0);
});

When('I select {string} for product change', async function (cardName: string) {
  const option = this.page.locator('.modal-content .glass-card').filter({ hasText: cardName }).first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.scrollIntoViewIfNeeded();
  await option.click();
});

When('I confirm the product change', async function () {
  const confirmBtn = this.page.locator('.modal-content button.btn-primary').filter({ hasText: /Confirm/i }).first();
  await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmBtn.click();
  await this.page.waitForURL(/\/card\/\d+/, { timeout: 8000 });
  await this.page.waitForTimeout(500);
});

When('I attempt a direct product change to {string}', async function (targetCardName: string) {
  const currentCardId = Number(this.page.url().match(/\/card\/(\d+)/)?.[1]);
  if (!currentCardId) throw new Error('Expected to be on a user card detail page');

  this.directProductChangeResult = await this.page.evaluate(async ({ currentCardId, targetCardName }) => {
    const w = window as unknown as ProductChangeTestWindow;
    const targetTemplate = w.cardTemplates.find(template => template.name === targetCardName);
    if (!targetTemplate) throw new Error(`Unknown target card: ${targetCardName}`);
    const before = await w.db.cards.toArray();
    let rejected = false;
    try {
      await w.productChangeCard(currentCardId, targetTemplate.id);
    } catch {
      rejected = true;
    }
    const after = await w.db.cards.toArray();
    return {
      rejected,
      cardsBefore: before,
      cardsAfter: after,
    };
  }, { currentCardId, targetCardName });
});

Then('the direct product change should be rejected without mutating the account', async function () {
  expect(this.directProductChangeResult).toEqual({
    rejected: true,
    cardsBefore: this.directProductChangeResult.cardsBefore,
    cardsAfter: this.directProductChangeResult.cardsBefore,
  });
});

Then('I should see {string} in the closed cards section', async function (statusText: string) {
  const badge = this.page.locator('.badge-red').filter({ hasText: statusText }).first();
  await expect(badge).toBeVisible({ timeout: 5000 });
});
