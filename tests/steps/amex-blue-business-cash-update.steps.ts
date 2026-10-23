import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CardTemplate } from '../../src/db/types';

// Like the citi-aadvantage-update step, but the unit is a quoted string because
// the Blue Business Cash unit contains spaces and parentheses
// ("cash back (up to; personalized offer)"), which {word} cannot match.
Then(
  'the {string} catalog sign-up bonus should be {int} {string} after {int} spend in {int} months',
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
