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
