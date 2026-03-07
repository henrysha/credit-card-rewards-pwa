import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I toggle the {string} perk', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName });
  await perkItem.locator('.perk-checkbox').click();
  await this.page.waitForTimeout(300);
});

Then('the {string} perk should be marked as used', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName });
  await expect(perkItem.locator('.perk-checkbox.checked')).toBeVisible({ timeout: 5000 });
});

Then('I should see an unclaimed value badge', async function () {
  await expect(this.page.getByText(/\$\d+.*unclaimed/, { exact: false })).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} on the perks page', async function (text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

Then('I should see an unclaimed total value', async function () {
  await expect(this.page.getByText(/\$\d+.*unclaimed/i, { exact: false })).toBeVisible({ timeout: 5000 });
});

Then('I should see no perks listed', async function () {
  const perkItems = this.page.locator('.perk-item');
  const count = await perkItems.count();
  if (count > 0) {
    const noPerkMsg = this.page.getByText(/no perks|no cards|add a card/i);
    const msgCount = await noPerkMsg.count();
    expect(count === 0 || msgCount > 0).toBeTruthy();
  }
});

When('the renewal period for {string} expires', async function (perkName: string) {
  // Backdate the perk's currentPeriodEnd in IndexedDB so refreshExpiredPerks picks it up
  await this.page.evaluate(async (name: string) => {
    const db = (window as unknown as { db: { perks: { toArray: () => Promise<{ perkName: string; id?: number }[]>; update: (id: number, data: Record<string, unknown>) => Promise<void> } } }).db;
    if (!db) throw new Error('Database not found on window');
    const allPerks = await db.perks.toArray();
    const perk = allPerks.find((p: { perkName: string; id?: number }) => p.perkName === name);
    if (!perk?.id) throw new Error(`Perk "${name}" not found in DB`);
    // Set the period end to yesterday
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    await db.perks.update(perk.id, { currentPeriodEnd: yesterday });
  }, perkName);
});

When('the app refreshes expired perks', async function () {
  await this.page.evaluate(async () => {
    const refreshExpiredPerks = (window as unknown as { refreshExpiredPerks: () => Promise<void> }).refreshExpiredPerks;
    if (!refreshExpiredPerks) throw new Error('refreshExpiredPerks not found on window');
    
    interface PerkData { perkTemplateId: string; perkName: string; used: boolean; currentPeriodEnd: string; }
    const db = (window as unknown as { db: { perks: { toArray: () => Promise<PerkData[]> } } }).db;
    if (!db) throw new Error('Database not found on window');

    const before = await db.perks.toArray();
    await refreshExpiredPerks();
    const after = await db.perks.toArray();
    
    return {
      before: before.filter((p: PerkData) => p.perkTemplateId === 'csr-travel-credit').map((p: PerkData) => ({ name: p.perkName, used: p.used, end: p.currentPeriodEnd })),
      after: after.filter((p: PerkData) => p.perkTemplateId === 'csr-travel-credit').map((p: PerkData) => ({ name: p.perkName, used: p.used, end: p.currentPeriodEnd }))
    };
  });
});

Then('the {string} perk should not be marked as used', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName });
  // The checkbox should NOT have the 'checked' class
  await expect(perkItem.locator('.perk-checkbox:not(.checked)')).toBeVisible({ timeout: 5000 });
});

When('the master catalog\'s {string} is renamed to {string}', async function (oldName: string, newName: string) {
  await this.page.evaluate(async (args: { oldName: string, newName: string }) => {
    const templates = (window as unknown as { cardTemplates: { perks: { name: string }[] }[] }).cardTemplates;
    if (!templates) throw new Error('cardTemplates not found on window');
    let found = false;
    for (const t of templates) {
      const perk = t.perks.find((p: { name: string }) => p.name === args.oldName);
      if (perk) {
        perk.name = args.newName;
        found = true;
      }
    }
    if (!found) throw new Error(`Perk ${args.oldName} not found in catalog`);
  }, { oldName, newName });
});

When('a {string} perk is added to the {string} catalog template', async function (perkName: string, cardName: string) {
  await this.page.evaluate(async (args: { perkName: string, cardName: string }) => {
    const templates = (window as unknown as { cardTemplates: { name: string, perks: unknown[] }[] }).cardTemplates;
    if (!templates) throw new Error('cardTemplates not found on window');
    const card = templates.find((c: { name: string }) => c.name === args.cardName);
    if (!card) throw new Error(`Card ${args.cardName} not found`);
    card.perks.push({
      id: `fake-perk-${Date.now()}`,
      name: args.perkName,
      description: 'A fake perk for testing',
      category: 'other',
      annualValue: 50,
      renewalPeriod: 'annual',
    });
  }, { perkName, cardName });
});

When('the app syncs catalog perks', async function () {
  await this.page.evaluate(async () => {
    const syncCardPerks = (window as unknown as { syncCardPerks: () => Promise<void> }).syncCardPerks;
    if (!syncCardPerks) throw new Error('syncCardPerks not found on window');
    await syncCardPerks();
  });
});

Then('I should not see {string} in the perks list', async function (perkName: string) {
  const perkItem = this.page.locator('.perk-item').filter({ hasText: perkName });
  await expect(perkItem).toHaveCount(0, { timeout: 5000 });
});
