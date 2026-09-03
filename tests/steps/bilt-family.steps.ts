import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('Bilt cards should share the {string} family', async function (family: string) {
  const families = await this.page.evaluate(() =>
    ((window as unknown as { cardTemplates: Array<{ issuer: string; family?: string }> }).cardTemplates)
      .filter(card => card.issuer === 'Bilt')
      .map(card => card.family)
  );
  expect(families).toEqual([family, family, family]);
});

Then('the Bilt welcome rule should affect all three Bilt cards', async function () {
  const affected = await this.page.evaluate(() => {
    const rules = (window as unknown as { churningRules?: Array<{ issuer: string; affectedCards?: string[] }> }).churningRules;
    return rules?.find(rule => rule.issuer === 'Bilt')?.affectedCards;
  });
  expect(affected).toEqual(['bilt-blue', 'bilt-obsidian', 'bilt-palladium']);
});
