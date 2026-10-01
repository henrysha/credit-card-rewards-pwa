import { db } from '../db/database';

/** Advance past fee dates to their next occurrence, using the local calendar day. */
export async function refreshAnnualFeeDates(now: Date = new Date()): Promise<void> {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  await db.transaction('rw', db.cards, async () => {
    const cards = await db.cards.where('status').equals('active').toArray();
    for (const card of cards) {
      const feeDate = card.annualFeeDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(feeDate) || feeDate >= today) continue;
      let parsed = new Date(`${feeDate}T00:00:00Z`);
      if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== feeDate) continue;

      let anchorDate = feeDate;
      if (card.annualFeeAnchorDate) {
        const anchor = new Date(`${card.annualFeeAnchorDate}T00:00:00Z`);
        if (Number.isFinite(anchor.getTime()) && anchor.toISOString().slice(0, 10) === card.annualFeeAnchorDate) {
          parsed = anchor;
          anchorDate = card.annualFeeAnchorDate;
        }
      }

      const month = parsed.getUTCMonth();
      const day = parsed.getUTCDate();
      const occurrence = (year: number) => {
        // February 29 falls on February 28 in non-leap years.
        const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        return new Date(Date.UTC(year, month, Math.min(day, lastDay))).toISOString().slice(0, 10);
      };
      let year = now.getFullYear();
      if (occurrence(year) < today) year++;
      await db.cards.update(card.id!, { annualFeeDate: occurrence(year), annualFeeAnchorDate: anchorDate });
    }
  });
}
