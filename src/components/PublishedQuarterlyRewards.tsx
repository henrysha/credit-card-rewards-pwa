import type { EarningRate, QuarterlyRewards } from '../db/types';

interface PublishedQuarterlyRewardsProps {
  rate: EarningRate;
  quarter: QuarterlyRewards;
  upcoming?: boolean;
}

export function PublishedQuarterlyRewards({ rate, quarter, upcoming = false }: PublishedQuarterlyRewardsProps) {
  return (
    <div data-testid={upcoming ? 'published-next-quarter-rewards' : 'published-quarterly-rewards'} className="mb-sm">
      <div className="text-xs text-secondary mb-xs">
        {upcoming ? 'Automatically scheduled' : 'Published categories'} · Activation required with Chase
      </div>
      {quarter.categories.map(category => (
        <div key={category} className="earning-rate">
          <div className="earning-multiplier">{quarter.categoryMultipliers?.[category] ?? rate.multiplier}x</div>
          <div className="earning-category">{category}</div>
        </div>
      ))}
      <div className="quarterly-terms">
        <div>{rate.limit} combined · {quarter.start} – {quarter.end}</div>
        <div>Activate by {quarter.activationDeadline}</div>
        <a href={quarter.source} target="_blank" rel="noopener noreferrer">Chase categories & activation ↗</a>
      </div>
    </div>
  );
}
