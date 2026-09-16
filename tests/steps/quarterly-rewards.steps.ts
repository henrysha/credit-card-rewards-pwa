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

Then('I should not see the rotating rewards section', async function () {
  const section = this.page.locator('[data-testid="quarterly-rewards-section"]');
  await expect(section).toHaveCount(0);
});

Then('I should see {string} in the rotating rewards section', async function (category: string) {
  const section = this.page.locator('[data-testid="quarterly-rewards-section"]');
  await expect(section).toBeVisible({ timeout: 5000 });
  await expect(section).toContainText(category);
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

When('I queue a next quarter reward for {string} with {string} multiplier and cleared limit', async function (category: string, multiplierStr: string) {
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

  const limitInput = this.page.locator('[data-testid="reward-limit-input"]');
  await limitInput.fill('');

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

Then('the queued reward for {string} should not have a spend limit displayed', async function (category: string) {
  const item = this.page.locator(`[data-testid="queued-reward-item"][data-category="${category}"]`);
  await expect(item).toBeVisible({ timeout: 5000 });
  await expect(item.locator('.text-muted')).toHaveCount(0);
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
  await this.page.evaluate(() => {
    const w = window as unknown as {
      getNextQuarter: () => { startDate: string };
      setMockDate: (d: string) => void;
    };
    const nextQ = w.getNextQuarter();
    w.setMockDate(nextQ.startDate);
  });
  // Observe mock date event triggering boundary refresh without calling rotateQuarterlyRewards directly
  await this.page.waitForTimeout(2000);
});

When('the calendar reaches the next quarter boundary', async function () {
  const nextStartDate = await this.page.evaluate(() => {
    const w = window as unknown as { getNextQuarter: () => { startDate: string } };
    return w.getNextQuarter().startDate;
  });
  await this.page.close();
  this.postBoundaryTime = new Date(`${nextStartDate}T12:00:00Z`);
});

When('I reopen the app', async function () {
  if (this.page && !this.page.isClosed()) {
    await this.page.close();
  }
  this.page = await this.context.newPage();
  if (this.postBoundaryTime) {
    await this.page.clock.install({ time: this.postBoundaryTime });
  }
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.evaluate((id: string) => {
    sessionStorage.setItem('test_db', id);
    sessionStorage.removeItem('mock_date');
  }, this.testDbId!);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(500);
});

Given('I open the app in a timezone ahead of UTC', async function () {
  await this.page?.close();
  await this.context?.close();
  this.context = await this.browser.newContext({
    timezoneId: 'Pacific/Kiritimati',
    permissions: ['notifications', 'clipboard-read', 'clipboard-write']
  });
  this.page = await this.context.newPage();
  // Install deterministic clock at 23:00 local time (09:00:00 UTC) at Q3 end
  // In Pacific/Kiritimati (+14), 2026-09-30 09:00:00 UTC is 2026-09-30 23:00:00 local (Q3)
  await this.page.clock.install({ time: new Date('2026-09-30T09:00:00Z') });
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.evaluate((id: string) => {
    sessionStorage.setItem('test_db', id);
    sessionStorage.removeItem('mock_date');
  }, this.testDbId!);
  await this.page.waitForLoadState('networkidle');
});

When('local midnight arrives for the new quarter while UTC is still the previous day', async function () {
  // Advance installed clock across midnight to 2026-09-30 10:00:02 UTC = 2026-10-01 00:00:02 local, firing scheduled midnight timer
  await this.page.clock.fastForward(3602_000);
  const dates = await this.page.evaluate(() => {
    const now = new Date();
    const localStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const utcStr = now.toISOString().slice(0, 10);
    return { local: localStr, utc: utcStr };
  });
  expect(dates.local).toBe('2026-10-01');
  expect(dates.utc).toBe('2026-09-30');
  // Wait for async refresh and IndexedDB rotation to settle
  await this.page.waitForTimeout(500);
});

Given(/^the current date is in (?:Q3|September)$/, async function () {
  await this.page?.close();
  await this.context?.close();
  this.context = await this.browser.newContext({
    timezoneId: 'America/New_York',
    permissions: ['notifications', 'clipboard-read', 'clipboard-write'],
  });
  this.page = await this.context.newPage();
  // Install deterministic clock in mid-September 2026 (Q3) before navigation
  await this.page.clock.install({ time: new Date('2026-09-15T12:00:00Z') });
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.evaluate((id: string) => {
    sessionStorage.setItem('test_db', id);
    sessionStorage.removeItem('mock_date');
  }, this.testDbId!);
  await this.page.waitForLoadState('networkidle');
});

Given(/^the current date is in (?:Q4|December)$/, async function () {
  await this.page?.close();
  await this.context?.close();
  this.context = await this.browser.newContext({
    timezoneId: 'America/New_York',
    permissions: ['notifications', 'clipboard-read', 'clipboard-write']
  });
  this.page = await this.context.newPage();
  // Install deterministic clock in mid-December 2026 before navigation
  await this.page.clock.install({ time: new Date('2026-12-15T12:00:00Z') });
  await this.page.goto(`${this.baseUrl}?test_db=${this.testDbId}`);
  await this.page.evaluate((id: string) => {
    sessionStorage.setItem('test_db', id);
    sessionStorage.removeItem('mock_date');
  }, this.testDbId!);
  await this.page.waitForLoadState('networkidle');
});

Then('the next quarter queue should be for {string} of next year', async function (quarterPrefix: string) {
  const section = this.page.locator('[data-testid="quarterly-rewards-section"]');
  await expect(section).toBeVisible({ timeout: 5000 });
  await expect(section).toContainText(`Next Quarter Queue (${quarterPrefix} 2027)`);
});

When('the calendar reaches January 1st of next year', async function () {
  // Close the old page before advancing time to ensure startup rotation is tested on reopen
  await this.page.close();
  this.postBoundaryTime = new Date('2027-01-01T12:00:00Z');
});

Then('{string} broad category should remain at {string}', async function (category: string, multiplier: string) {
  const row = this.page.locator(`.best-card-row[data-category="${category}"]`).first();
  await row.scrollIntoViewIfNeeded();
  await expect(row).toBeVisible({ timeout: 5000 });
  await expect(row.locator('.text-gold').first()).toHaveText(multiplier);
});

Then('I should see the {string} subcategory with {string} multiplier', async function (subcategory: string, multiplier: string) {
  const row = this.page.locator(`.best-card-row[data-category="${subcategory}"]`).first();
  await row.scrollIntoViewIfNeeded();
  await expect(row).toBeVisible({ timeout: 5000 });
  await expect(row.locator('[class*="text-gold"]').first()).toHaveText(multiplier);
});

Then('I should see a toast confirming {string}', async function (text: string) {
  const toast = this.page.locator('.toast').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(text);
});

Then('the rewards lifecycle handles cleanup without rescheduling or orphan timers', async function () {
  const result = await this.page.evaluate(`(async () => {
    const w = window;
    if (typeof w.setupRewardsLifecycle !== 'function') {
      throw new Error('setupRewardsLifecycle is not exposed on window');
    }
    const origSetTimeout = window.setTimeout;
    const origClearTimeout = window.clearTimeout;
    const origSetInterval = window.setInterval;
    let intervalsCreated = 0;

    window.setInterval = function (...args) {
      intervalsCreated++;
      return origSetInterval.apply(window, args);
    };

    const lifecycleTimers = new Set();
    const capturedCallbacks = [];
    let tracking = false;

    window.setTimeout = function (fn, delay) {
      if (tracking) {
        capturedCallbacks.push(fn);
      }
      const id = origSetTimeout.call(window, fn, delay);
      if (tracking) {
        lifecycleTimers.add(id);
      }
      return id;
    };

    window.clearTimeout = function (id) {
      if (id !== undefined) lifecycleTimers.delete(id);
      origClearTimeout.call(window, id);
    };

    try {
      tracking = true;
      const cleanup = w.setupRewardsLifecycle();
      tracking = false;

      const initialTimerCount = lifecycleTimers.size;
      const callback = capturedCallbacks[0];

      // Cleanup cancels active timers
      cleanup();
      const timerCountAfterCleanup = lifecycleTimers.size;

      // Invoking callback after cleanup must not rearm timers
      if (callback) {
        tracking = true;
        await callback();
        tracking = false;
      }
      const timerCountAfterCallback = lifecycleTimers.size;

      return {
        intervalsCreated,
        initialTimerCount,
        timerCountAfterCleanup,
        timerCountAfterCallback,
      };
    } finally {
      window.setTimeout = origSetTimeout;
      window.clearTimeout = origClearTimeout;
      window.setInterval = origSetInterval;
    }
  })()`);

  expect(result.intervalsCreated).toBe(0);
  expect(result.initialTimerCount).toBe(1);
  expect(result.timerCountAfterCleanup).toBe(0);
  expect(result.timerCountAfterCallback).toBe(0);
});
