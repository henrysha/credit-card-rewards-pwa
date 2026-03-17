import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// ── Notification permission prompt ──

Then('I should not see the notification permission prompt', async function () {
  await expect(this.page.locator('.notification-prompt')).not.toBeVisible({ timeout: 5000 });
});

// ── Perk expiry manipulation for badge testing ──

Given('a perk {string} is set to expire in {int} days', async function (perkName: string, days: number) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const dateStr = futureDate.toLocaleDateString('en-US');

  await this.page.evaluate(async (args: { name: string; date: string }) => {
    const db = (window as unknown as { db: { perks: { toArray: () => Promise<{ perkName: string; id?: number }[]>; update: (id: number, data: Record<string, unknown>) => Promise<void> } } }).db;
    if (!db) throw new Error('Database not found on window');
    const allPerks = await db.perks.toArray();
    const perk = allPerks.find((p: { perkName: string }) => p.perkName === args.name);
    if (!perk?.id) throw new Error(`Perk "${args.name}" not found in DB`);
    await db.perks.update(perk.id, { currentPeriodEnd: args.date });
  }, { name: perkName, date: dateStr });
});

// ── Urgency badge assertions ──

Then('I should see an urgency badge on {string}', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName }).first();
  await expect(perkItem.locator('.badge-urgent')).toBeVisible({ timeout: 5000 });
});

Then('I should see a warning badge on {string}', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName }).first();
  await expect(perkItem.locator('.badge-warning')).toBeVisible({ timeout: 5000 });
});

Then('I should not see an urgency badge on {string}', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName }).first();
  await expect(perkItem.locator('.badge-urgent')).not.toBeVisible({ timeout: 3000 });
  await expect(perkItem.locator('.badge-warning')).not.toBeVisible({ timeout: 3000 });
});

Then('I should see {string} badge on {string}', async function (badgeText: string, perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName }).first();
  await expect(perkItem.locator('.badge').filter({ hasText: badgeText })).toBeVisible({ timeout: 5000 });
});

Then('I should see a push notification {string} containing {string}', async function (expectedTitle: string, expectedContent: string) {
  // Capture notifications by mocking the Notification constructor
  // Pass as string to avoid tsx/esbuild injecting __name or other helpers
  await this.page.evaluate(`
    (function() {
      // Clear storage to bypass "once per day" throttling for tests
      localStorage.clear();

      window.capturedNotifications = [];
      
      const MockNotification = function(title, options) {
        console.log('Push notification captured:', title, options);
        window.capturedNotifications.push({ title, options });
        return {
          onclick: null,
          onshow: null,
          onerror: null,
          onclose: null,
          close: function() {}
        };
      };
      
      MockNotification.permission = 'granted';
      MockNotification.requestPermission = function() {
        return Promise.resolve('granted');
      };
      
      window.Notification = MockNotification;
      console.log('Notification API Mocked in browser with "granted" permission');
    })();
  `);

  // Explicitly trigger the notification check. Use a retry loop to wait for it to be available on window.
  await this.page.evaluate(async () => {
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      const w = window as unknown as { runNotificationChecks?: () => Promise<void> };
      if (w.runNotificationChecks) {
        console.log('Explicitly triggering runNotificationChecks from test');
        await w.runNotificationChecks();
        return;
      }
      console.log('runNotificationChecks not found on window, retrying...', i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.warn('runNotificationChecks not found on window after retries');
  });

  await this.page.waitForFunction(() => ((window as unknown as { capturedNotifications: unknown[] }).capturedNotifications || []).length > 0, { timeout: 10000 });

  const notifications = await this.page.evaluate(() => (window as unknown as { capturedNotifications: unknown[] }).capturedNotifications) as { title: string; options: NotificationOptions }[];
  const notification = notifications.find(n => n.title === expectedTitle);

  expect(notification).toBeDefined();
  expect(notification?.options.body).toContain(expectedContent);
});

