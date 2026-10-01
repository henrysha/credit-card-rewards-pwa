import { Given, Then, type DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CardTemplate, UserPerk } from '../../src/db/types';

type PerkDb = {
  perks: {
    toArray: () => Promise<UserPerk[]>;
    update: (id: number, changes: Partial<UserPerk>) => Promise<unknown>;
  };
};

Then('the {string} catalog perks should have these terms:', async function (cardName: string, table: DataTable) {
  const perks = await this.page.evaluate((name: string) => {
    const templates = (window as unknown as { cardTemplates: CardTemplate[] }).cardTemplates;
    return templates.find(card => card.name === name)?.perks;
  }, cardName);

  for (const row of table.hashes()) {
    const perk = perks?.find(p => p.id === row.id);
    expect(perk, `Catalog perk ${row.id}`).toMatchObject({
      annualValue: Number(row.annualValue),
      renewalPeriod: row.renewalPeriod,
      expirationDate: row.expirationDate,
    });
    expect(perk?.periodValue).toBe(row.periodValue ? Number(row.periodValue) : undefined);
    if (row.id !== 'csr-select-hotel') expect(perk?.requiresEnrollment).toBe(true);
  }
});

Given('my tracked DoorDash perk has the old five-dollar terms with activation {string}', async function (active: string) {
  await this.page.evaluate(async (activation: string) => {
    const db = (window as unknown as { db: PerkDb }).db;
    const perk = (await db.perks.toArray()).find(p => p.perkTemplateId === 'csr-restaurant-doordash');
    if (!perk?.id) throw new Error('Tracked DoorDash perk missing');
    sessionStorage.setItem('originalDoorDashPerkId', String(perk.id));
    await db.perks.update(perk.id, {
      perkName: '$5 DoorDash Restaurant Credit',
      annualValue: 60,
      periodValue: 5,
      active: activation === 'true',
    });
  }, active);
});

Then('my tracked DoorDash perk should have value {int} and annual value {int} with activation {string}', async function (value: number, annualValue: number, active: string) {
  const result = await this.page.evaluate(async () => {
    const db = (window as unknown as { db: PerkDb }).db;
    return {
      originalId: Number(sessionStorage.getItem('originalDoorDashPerkId')),
      perks: (await db.perks.toArray()).filter(p => p.perkTemplateId === 'csr-restaurant-doordash'),
    };
  });
  expect(result.perks).toHaveLength(1);
  expect(result.perks[0]).toMatchObject({
    id: result.originalId,
    perkName: '$15 DoorDash Credit',
    periodValue: value,
    annualValue,
    active: active === 'true',
    renewalPeriod: 'monthly',
    used: false,
  });
  const perkItem = this.page.locator('.perk-item').filter({ hasText: '$15 DoorDash Credit' });
  await expect(perkItem.locator('.perk-value')).toHaveText(`$${value}`);
  await expect(perkItem.locator('.perk-period')).toHaveText('/mo');
});
