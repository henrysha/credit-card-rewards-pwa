import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { cardTemplates } from '../../src/db/seed-data';

When('I attempt a direct product change to {string}', async function (targetCardName: string) {
  const targetTemplate = cardTemplates.find(card => card.name === targetCardName);
  if (!targetTemplate) throw new Error(`Unable to find direct product change target: ${targetCardName}`);
  const result = await this.page.evaluate(async (targetName: string) => {
    const win = window as unknown as {
      db: { cards: { toArray: () => Promise<Array<{ id?: number }>> } };
      productChangeCard: (cardId: number, targetTemplateId: string) => Promise<number>;
    };
    const cards = await win.db.cards.toArray();
    if (!cards[0]?.id) throw new Error(`Unable to find current card for direct product change: ${targetName}`);
    try {
      await win.productChangeCard(cards[0].id, targetName);
      return { error: '', status: '' };
    } catch (error) {
      const unchangedCards = await win.db.cards.toArray();
      return {
        error: error instanceof Error ? error.message : String(error),
        status: unchangedCards[0]?.status ?? '',
      };
    }
  }, targetTemplate.id);
  this.directProductChangeError = result.error;
  this.directProductChangeStatus = result.status;
});

Then('the direct product change should be rejected', async function () {
  expect(this.directProductChangeError).toContain('same card family');
  expect(this.directProductChangeStatus).toBe('active');
});

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

Then('I should see {string} in the closed cards section', async function (statusText: string) {
  const badge = this.page.locator('.badge-red').filter({ hasText: statusText }).first();
  await expect(badge).toBeVisible({ timeout: 5000 });
});
