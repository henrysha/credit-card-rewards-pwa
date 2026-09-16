import type { EarningRate, QuarterlyRewards } from './types';

// Append verified quarters here; never reuse last quarter's categories as current.
export const freedomQuarterlySchedule: QuarterlyRewards[] = [{
  start: '2026-07-01',
  end: '2026-09-30',
  activationDeadline: '2026-09-14',
  categories: ['Gas Stations', 'Public Transit', 'EV Charging', 'Select Live Entertainment', 'United Way'],
  source: 'https://www.chase.com/personal/credit-cards/freedom/freedomfive',
}];

export function currentQuarterRewards(rate: EarningRate, now = new Date()): QuarterlyRewards | undefined {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return rate.quarterlySchedule?.find(q => q.start <= today && today <= q.end);
}

export function resolveEarningRates(rates: EarningRate[], now = new Date()): EarningRate[] {
  return rates.flatMap(rate => {
    if (!rate.quarterlySchedule) return [rate];
    const quarter = currentQuarterRewards(rate, now);
    if (!quarter) return [];
    return quarter.categories.map(category => ({
      category,
      recommendationCategory: category === 'Gas Stations' ? 'Gas' : category,
      multiplier: rate.multiplier,
      limit: `If activated by ${quarter.activationDeadline}; $1,500 combined/quarter; through ${quarter.end}`,
    }));
  });
}
