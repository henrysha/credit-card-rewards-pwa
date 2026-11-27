import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const POSTURE_VIEWPORTS: Record<string, { width: number; height: number }> = {
  'folded-outer': { width: 382, height: 600 },
  'folded-pwa': { width: 466, height: 678 },
  'split-view': { width: 385, height: 626 },
  'unfolded-portrait': { width: 626, height: 890 },
  'unfolded-landscape': { width: 890, height: 626 },
};

Given('the viewport is set to iPhone Duo {string}', async function (posture: string) {
  const size = POSTURE_VIEWPORTS[posture];
  if (!size) throw new Error(`Unknown posture: ${posture}`);
  await this.page.setViewportSize(size);
  await this.page.waitForTimeout(200);
});

Then('the web app manifest should allow any orientation and use theme color {string}', async function (expectedColor: string) {
  const manifest = await this.page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!link) throw new Error('Manifest link not found');
    const res = await fetch(link.href);
    return res.json();
  });
  expect(manifest.orientation).toBe('any');
  expect(manifest.theme_color).toBe(expectedColor);
  expect(manifest.background_color).toBe(expectedColor);
});

Then('the bottom navigation should have 5 items and compact height', async function () {
  const navItems = this.page.locator('.bottom-nav .nav-item');
  await expect(navItems).toHaveCount(5);
  const innerBox = await this.page.locator('.bottom-nav-inner').boundingBox();
  expect(innerBox).not.toBeNull();
  expect(innerBox!.height).toBeLessThanOrEqual(58);
});

Then('I should see the dashboard quick jump pills', async function () {
  const quickNav = this.page.locator('.dashboard-quick-nav');
  await expect(quickNav).toBeVisible();
  await expect(quickNav.locator('.quick-jump-pill')).toHaveCount(3);
});

Then('the best card rows should use compact height without horizontal overflow', async function () {
  const row = this.page.locator('.best-card-row').first();
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeLessThanOrEqual(56);

  const hasOverflow = await this.page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(hasOverflow).toBe(false);
});

Then('the perks page should display the compact period selector without horizontal overflow', async function () {
  const select = this.page.getByLabel('Filter by renewal period');
  await expect(select).toBeVisible();
  await expect(this.page.locator('.perks-period-tabs')).toBeHidden();

  const hasOverflow = await this.page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(hasOverflow).toBe(false);
});

Then('the perk info button should meet the 44px minimum touch target', async function () {
  const infoBtn = this.page.locator('.info-btn').first();
  await expect(infoBtn).toBeVisible();
  const box = await infoBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

Then('the signup bonus edit button should meet the 44px minimum touch target', async function () {
  const editBtn = this.page.locator('.edit-icon-btn').first();
  await expect(editBtn).toBeVisible();
  const box = await editBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

Then('the opening date and annual fee date fields should stack vertically', async function () {
  const openedInput = this.page.getByLabel('Opening Date', { exact: true });
  const feeInput = this.page.getByLabel('Next Annual Fee Date', { exact: true });
  const openedBox = await openedInput.boundingBox();
  const feeBox = await feeInput.boundingBox();
  expect(openedBox).not.toBeNull();
  expect(feeBox).not.toBeNull();
  expect(feeBox!.y).toBeGreaterThan(openedBox!.y + openedBox!.height);
});

When('I press Escape to close the modal', async function () {
  await this.page.keyboard.press('Escape');
});

Then('the modal should close and restore focus to {string}', async function (buttonLabel: string) {
  await expect(this.page.locator('.modal-overlay')).toHaveCount(0);
  const focusedAriaLabel = await this.page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent);
  expect(focusedAriaLabel).toContain(buttonLabel);
});

Then('the navigation bar should be a centered floating pill dock', async function () {
  const nav = this.page.locator('.bottom-nav');
  const box = await nav.boundingBox();
  const radius = await nav.evaluate((el: HTMLElement) => getComputedStyle(el).borderRadius);
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(442);
  expect(radius).toBe('9999px');
});

Then('the active cards list should render as a 2-column grid', async function () {
  const tiles = this.page.locator('.cards-grid .card-tile');
  await expect(tiles).toHaveCount(2);
  const firstBox = await tiles.nth(0).boundingBox();
  const secondBox = await tiles.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(10);
  expect(secondBox!.x).toBeGreaterThan(firstBox!.x + firstBox!.width);
});

Then('the catalog list should render as a 2-column grid', async function () {
  const cards = this.page.locator('.catalog-list .glass-card');
  const firstBox = await cards.nth(0).boundingBox();
  const secondBox = await cards.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(10);
  expect(secondBox!.x).toBeGreaterThan(firstBox!.x + firstBox!.width);
});

Then('the navigation bar should be a 72px left vertical rail', async function () {
  const nav = this.page.locator('.bottom-nav');
  const box = await nav.boundingBox();
  const flexDir = await this.page.locator('.bottom-nav-inner').evaluate((el: HTMLElement) => getComputedStyle(el).flexDirection);
  expect(box).not.toBeNull();
  expect(Math.round(box!.width)).toBe(72);
  expect(box!.x).toBe(0);
  expect(flexDir).toBe('column');
});

Then('the dashboard should render a 2-pane split with a 24px center fold gap', async function () {
  const leftPane = this.page.locator('.dashboard-left-pane');
  const rightPane = this.page.locator('.dashboard-right-pane');
  const leftBox = await leftPane.boundingBox();
  const rightBox = await rightPane.boundingBox();
  expect(leftBox).not.toBeNull();
  expect(rightBox).not.toBeNull();
  const gap = Math.round(rightBox!.x - (leftBox!.x + leftBox!.width));
  expect(gap).toBe(24);
});

Then('I should see the wallet master list alongside the card detail pane', async function () {
  const masterPane = this.page.getByTestId('wallet-master-pane');
  const detailPane = this.page.getByTestId('card-detail-pane');
  await expect(masterPane).toBeVisible();
  await expect(detailPane).toBeVisible();
  const masterBox = await masterPane.boundingBox();
  const detailBox = await detailPane.boundingBox();
  expect(masterBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(Math.round(detailBox!.x - (masterBox!.x + masterBox!.width))).toBe(24);
});

When('I select {string} from the wallet master list', async function (cardName: string) {
  const masterPane = this.page.getByTestId('wallet-master-pane');
  const cardBtn = masterPane.locator('.duo-master-card').filter({ hasText: cardName }).first();
  await cardBtn.click();
});

Then('the card detail pane should display {string} and receive keyboard focus', async function (cardName: string) {
  await expect(this.page.locator('.card-name')).toHaveText(cardName);
  const activeTag = await this.page.evaluate(() => ({
    className: document.activeElement?.className || '',
    text: document.activeElement?.textContent || '',
  }));
  expect(activeTag.className).toContain('duo-detail-heading');
  expect(activeTag.text).toContain(cardName);
});
