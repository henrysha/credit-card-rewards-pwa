import assert from 'node:assert/strict';
import { cardTemplates } from '../../src/db/seed-data';
import { resolveEarningRates } from '../../src/db/quarterly-rewards';
import { getBestCardPerCategory } from '../../src/utils/rewards';

export function verifyQuarterlyRewards() {
  const q3Categories = ['Gas Stations', 'Public Transit', 'EV Charging', 'Select Live Entertainment', 'United Way'];
  const q1Categories = ['Grocery Stores (excluding Walmart and Target)', 'Top Streaming Services'];
  // [date, expected quarterly earning-rate count, expected 5x categories, activation deadline]
  const cases = [
    { date: '2026-06-30', count: 0, categories: [] as string[], deadline: '' },
    { date: '2026-07-01', count: 5, categories: q3Categories, deadline: '2026-09-14' },
    { date: '2026-09-30', count: 5, categories: q3Categories, deadline: '2026-09-14' },
    { date: '2027-01-01', count: 2, categories: q1Categories, deadline: '2027-03-14' },
    { date: '2027-07-01', count: 0, categories: [] as string[], deadline: '' },
  ] as const;
  for (const id of ['chase-freedom', 'chase-freedom-flex']) {
    const card = cardTemplates.find(t => t.id === id)!;
    for (const { date, count, categories, deadline } of cases) {
      const now = new Date(`${date}T12:00:00`);
      assert.equal(resolveEarningRates(card.earningRates, now).filter(r => r.recommendationCategory).length, count);
      const results = getBestCardPerCategory([card], now);
      assert.equal(results.find(r => r.category === 'Gas')?.multiplier, categories.includes('Gas Stations') ? 5 : 1);
      assert.equal(results.find(r => r.category === 'Streaming')?.multiplier, 1);
      assert.equal(results.find(r => r.category === 'Transit & Rideshare')?.multiplier, 1);
      for (const category of categories) {
        // Mirror resolveEarningRates: 'Gas Stations' -> 'Gas', 'Grocery Stores ...' -> 'Groceries'.
        const recommendationCategory = category === 'Gas Stations' ? 'Gas' : category.startsWith('Grocery Stores') ? 'Groceries' : category;
        assert.equal(results.find(r => r.category === recommendationCategory)?.multiplier, 5);
        assert.match(results.find(r => r.category === recommendationCategory)!.limit!, new RegExp(`If activated by ${deadline}`));
      }
    }
    const other = cardTemplates.find(t => t.id === 'robinhood-gold-card')!;
    assert.ok(other);
    for (const templates of [[other, card], [card, other]]) {
      const results = getBestCardPerCategory(templates, new Date('2026-09-14T12:00:00'));
      assert.equal(results.find(r => r.category === 'Public Transit')?.multiplier, 5);
    }
  }
  assert.equal(cardTemplates.find(t => t.id === 'chase-freedom-unlimited')!.earningRates.some(r => r.quarterlySchedule), false);
}
