import assert from 'node:assert/strict';
import { cardTemplates } from '../../src/db/seed-data';
import { resolveEarningRates } from '../../src/db/quarterly-rewards';
import { getBestCardPerCategory } from '../../src/utils/rewards';

export function verifyQuarterlyRewards() {
  for (const id of ['chase-freedom', 'chase-freedom-flex']) {
    const card = cardTemplates.find(t => t.id === id)!;
    for (const [date, expected] of [['2026-06-30', 0], ['2026-07-01', 5], ['2026-09-30', 5], ['2026-10-01', 0], ['2027-07-01', 0]] as const) {
      const now = new Date(`${date}T12:00:00`);
      assert.equal(resolveEarningRates(card.earningRates, now).filter(r => r.recommendationCategory).length, expected);
      const results = getBestCardPerCategory([card], now);
      assert.equal(results.find(r => r.category === 'Gas')?.multiplier, expected ? 5 : 1);
      assert.equal(results.find(r => r.category === 'Streaming')?.multiplier, 1);
      assert.equal(results.find(r => r.category === 'Transit & Rideshare')?.multiplier, 1);
      if (expected) {
        for (const category of ['Public Transit', 'EV Charging', 'Select Live Entertainment', 'United Way']) {
          assert.equal(results.find(r => r.category === category)?.multiplier, 5);
          assert.match(results.find(r => r.category === category)!.limit!, /If activated by 2026-09-14/);
        }
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
