import type { RenewalPeriod } from '../db/types';

const periodSuffixes: Partial<Record<RenewalPeriod, string>> = {
  monthly: 'mo',
  quarterly: 'qtr',
  'semi-annual': '6mo',
  'every-4-years': '4yr',
};

export function PerkPeriod({ period }: { period: RenewalPeriod }) {
  return <div className="perk-period">/{periodSuffixes[period] ?? 'yr'}</div>;
}
