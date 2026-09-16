import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I navigate to the card detail page for {string}', async function (cardName: string) {
  await this.page.goto(`${this.baseUrl}cards`);
  await this.page.waitForLoadState('networkidle');

  const card = this.page.locator('.card-tile').filter({ hasText: cardName }).first();
  await card.waitFor({ state: 'visible', timeout: 5000 });
  await card.click();

  await this.page.waitForURL(/\/card\/\d+/);
  await this.page.waitForTimeout(500);
});

Then('I should see the rotating rewards section', async function () {
  const section = this.page.locator('[data-testid="quarterly-rewards-section"]');
  await expect(section).toBeVisible({ timeout: 5000 });
});

When('I queue a next quarter reward for {string} with {string} multiplier', async function (category: string, multiplierStr: string) {
  const queueBtn = this.page.locator('[data-testid="queue-next-quarter-btn"]');
  await queueBtn.waitFor({ state: 'visible', timeout: 5000 });
  await queueBtn.click();

  const modal = this.page.locator('[data-testid="quarterly-reward-modal"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });

  await this.page.locator('[data-testid="quarter-select"]').selectOption('next');

  const categoryInput = this.page.locator('[data-testid="reward-category-input"]');
  await categoryInput.fill(category);

  const multiplierNum = multiplierStr.replace(/[^0-9.]/g, '') || '5';
  const multiplierInput = this.page.locator('[data-testid="reward-multiplier-input"]');
  await multiplierInput.fill(multiplierNum);

  const saveBtn = this.page.locator('[data-testid="save-reward-btn"]');
  await saveBtn.click();

  await modal.waitFor({ state: 'hidden', timeout: 5000 });
  await this.page.waitForTimeout(300);
});

When('I add a current quarter reward for {string} with {string} multiplier', async function (category: string, multiplierStr: string) {
  const addBtn = this.page.locator('[data-testid="add-current-quarter-btn"]');
  await addBtn.waitFor({ state: 'visible', timeout: 5000 });
  await addBtn.click();

  const modal = this.page.locator('[data-testid="quarterly-reward-modal"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });

  await this.page.locator('[data-testid="quarter-select"]').selectOption('current');

  const categoryInput = this.page.locator('[data-testid="reward-category-input"]');
  await categoryInput.fill(category);

  const multiplierNum = multiplierStr.replace(/[^0-9.]/g, '') || '5';
  const multiplierInput = this.page.locator('[data-testid="reward-multiplier-input"]');
  await multiplierInput.fill(multiplierNum);

  const saveBtn = this.page.locator('[data-testid="save-reward-btn"]');
  await saveBtn.click();

  await modal.waitFor({ state: 'hidden', timeout: 5000 });
  await this.page.waitForTimeout(300);
});

Then('I should see {string} in the next quarter queue', async function (category: string) {
  const item = this.page.locator(`[data-testid="queued-reward-item"][data-category="${category}"]`);
  await expect(item).toBeVisible({ timeout: 5000 });
});

Then(/^I should (?:still )?see "([^"]*)" in the next quarter queue with "([^"]*)" status$/, async function (category: string, statusText: string) {
  const item = this.page.locator(`[data-testid="queued-reward-item"][data-category="${category}"]`);
  await expect(item).toBeVisible({ timeout: 5000 });
  await expect(item).toContainText(statusText);
});

Then('I should not see {string} in the next quarter queue', async function (category: string) {
  const item = this.page.locator(`[data-testid="queued-reward-item"][data-category="${category}"]`);
  await expect(item).toHaveCount(0, { timeout: 5000 });
});

When('I remove {string} from the next quarter queue', async function (category: string) {
  const item = this.page.locator(`[data-testid="queued-reward-item"][data-category="${category}"]`);
  await expect(item).toBeVisible({ timeout: 5000 });
  const delBtn = item.locator('[data-testid^="delete-queued-reward-"]');
  await delBtn.click();
  await expect(item).toHaveCount(0, { timeout: 5000 });
});

When('the calendar reaches the next quarter boundary while the app is open', async function () {
  await this.page.evaluate(async () => {
    const w = window as unknown as {
      getNextQuarter: () => { startDate: string };
      setMockDate: (d: string) => void;
      rotateQuarterlyRewards: () => Promise<void>;
    };
    const nextQ = w.getNextQuarter();
    w.setMockDate(nextQ.startDate);
    await w.rotateQuarterlyRewards();
  });
  // Wait for React re-render and Dexie live query propagation
  await this.page.waitForTimeout(1500);
});

When('the calendar reaches the next quarter boundary', async function () {
  await this.page.evaluate(() => {
    const w = window as unknown as {
      getNextQuarter: () => { startDate: string };
      setMockDate: (d: string) => void;
    };
    const nextQ = w.getNextQuarter();
    w.setMockDate(nextQ.startDate);
  });
});

When('I reopen the app', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(500);
});

Given('the current date is in Q4', async function () {
  await this.page.evaluate(() => {
    const w = window as unknown as {
      setMockDate: (d: string) => void;
    };
    // Set mock date to mid-Q4 (Nov 15, 2026)
    w.setMockDate('2026-11-15');
  });
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

Then('the next quarter queue should be for {string} of next year', async function (quarterPrefix: string) {
  const section = this.page.locator('[data-testid="quarterly-rewards-section"]');
  await expect(section).toBeVisible({ timeout: 5000 });
  await expect(section).toContainText(`Next Quarter Queue (${quarterPrefix} 2027)`);
});

When('the calendar reaches January 1st of next year', async function () {
  await this.page.evaluate(async () => {
    const w = window as unknown as {
      setMockDate: (d: string) => void;
      rotateQuarterlyRewards: () => Promise<void>;
    };
    w.setMockDate('2027-01-01');
    await w.rotateQuarterlyRewards();
  });
  await this.page.waitForTimeout(1000);
});
