import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { db as database } from '../../src/db/database';

When('the rotating reward is missing from my saved card', async function () {
  await this.page.evaluate(async () => {
    const db = (window as unknown as { db: typeof database }).db;
    await db.perks.filter(p => p.perkTemplateId.endsWith('-quarterly-rotation')).delete();
  });
});

Then('the rotating reward should have no fixed credit value and be unused', async function () {
  const perks = await this.page.evaluate(async () => {
    const db = (window as unknown as { db: typeof database }).db;
    return db.perks.filter(p => p.perkTemplateId.endsWith('-quarterly-rotation')).toArray();
  });
  expect(perks).toHaveLength(1);
  expect(perks[0].annualValue).toBe(0);
  expect(perks[0].periodValue).toBeUndefined();
  expect(perks[0].used).toBe(false);
  expect(perks[0].usedDate).toBeUndefined();
});
