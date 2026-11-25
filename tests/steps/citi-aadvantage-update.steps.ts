import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CardTemplate } from '../../src/db/types';

Then(
  'the {string} catalog sign-up bonus should be {int} {word} after {int} spend in {int} months',
  async function (cardName: string, points: number, unit: string, spend: number, timeMonths: number) {
    const bonus = await this.page.evaluate((name: string) => {
      const templates = (window as unknown as { cardTemplates: CardTemplate[] }).cardTemplates;
      return templates.find(card => card.name === name)?.signupBonus;
    }, cardName);

    expect(bonus, `Catalog sign-up bonus for ${cardName}`).toMatchObject({
      points,
      unit,
      spend,
      timeMonths,
    });
  },
);

Then(
  'the {string} catalog sign-up bonus should include {string}',
  async function (cardName: string, description: string) {
    const additionalBonus = await this.page.evaluate((name: string) => {
      const templates = (window as unknown as { cardTemplates: CardTemplate[] }).cardTemplates;
      return templates.find(card => card.name === name)?.signupBonus.additionalBonus;
    }, cardName);

    expect(additionalBonus, `Catalog additional bonus for ${cardName}`).toBeDefined();
    expect(additionalBonus?.description).toBe(description);
  },
);

Then(
  'the {string} catalog perk {string} should have an annual value of {int} with {string} renewal and require enrollment',
  async function (cardName: string, perkName: string, annualValue: number, renewalPeriod: string) {
    const perk = await this.page.evaluate(({ name, perkName: perk }: { name: string; perkName: string }) => {
      const templates = (window as unknown as { cardTemplates: CardTemplate[] }).cardTemplates;
      return templates.find(card => card.name === name)?.perks?.find(p => p.name === perk);
    }, { name: cardName, perkName });

    expect(perk, `Catalog perk ${perkName} for ${cardName}`).toBeDefined();
    expect(perk).toMatchObject({
      annualValue,
      renewalPeriod,
      requiresEnrollment: true,
    });
  },
);
