import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { verifyQuarterlyRewards } from '../support/quarterly-rewards-checks';

Given('the rewards date is {string}', async function (date: string) {
  await this.page.clock.setFixedTime(new Date(`${date}T12:00:00`));
});

Then('the quarterly earning rates should show {string}', async function (text: string) {
  await expect(this.page.getByTestId('quarterly-categories')).toContainText(text);
});

Then('no quarterly category schedule should be displayed', async function () {
  await expect(this.page.getByTestId('quarterly-categories')).toHaveCount(0);
});

Then('quarterly reward date boundaries and recommendations should be accurate', function () {
  verifyQuarterlyRewards();
});

When('the PWA resumes on {string}', async function (date: string) {
  await this.page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await this.page.clock.setFixedTime(new Date(`${date}T12:00:00`));
  await this.page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
});

Given('the rewards clock starts just before the quarter ends', async function () {
  const time = new Date('2026-09-30T23:59:00');
  await this.page.clock.install({ time });
  // Keep timers running while Dexie and React finish rendering the card.
  // Pausing here also freezes their scheduled work before the first assertion.
});

When('the rewards clock passes midnight', async function () {
  await this.page.clock.fastForward(61_000);
});

Given('the rewards viewport is a narrow phone', async function () {
  await this.page.setViewportSize({ width: 320, height: 800 });
});

Then('each quarterly category should have its own 5x earning row', async function () {
  const section = this.page.getByTestId('quarterly-categories');
  await expect(section.locator('.earning-rate')).toHaveCount(5);
  for (const category of ['Gas Stations', 'Public Transit', 'EV Charging', 'Select Live Entertainment', 'United Way']) {
    const row = section.locator('.earning-rate').filter({ hasText: category });
    await expect(row.locator('.earning-category')).toHaveText(category);
    await expect(row.locator('.earning-multiplier')).toHaveText('5x');
  }
});

Then('each quarterly recommendation should have readable category, card, and multiplier columns', async function () {
  for (const category of ['Gas', 'Public Transit', 'EV Charging', 'Select Live Entertainment', 'United Way']) {
    const row = this.page.locator(`.best-card-row[data-category="${category}"]`);
    await expect(row).toBeVisible();
    const columns = row.locator(':scope > div');
    await expect(columns.nth(0)).toContainText(category);
    await expect(columns.nth(1)).toHaveText('Chase Freedom');
    await expect(columns.nth(2)).toHaveText('5x');
    const boxes = await columns.evaluateAll(elements => elements.map(el => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width, overflow: el.scrollWidth > el.clientWidth + 1 };
    }));
    expect(boxes[0].width).toBeGreaterThan(40);
    expect(boxes[1].width).toBeGreaterThan(40);
    expect(boxes.every(box => !box.overflow && box.left >= 0 && box.right <= 320)).toBe(true);
    expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left);
    expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left);
  }
});

Then('quarterly recommendation terms should appear once outside the rows', async function () {
  const terms = this.page.getByTestId('quarterly-recommendation-terms');
  await expect(terms).toHaveCount(1);
  await expect(terms).toContainText('$1,500 combined/quarter');
  await expect(this.page.locator('.best-card-row').filter({ hasText: 'If activated' })).toHaveCount(0);
});
