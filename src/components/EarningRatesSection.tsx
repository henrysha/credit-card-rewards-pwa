import { useCurrentDate } from '../hooks/useCurrentDate';
import { currentQuarterRewards } from '../db/quarterly-rewards';
import type { EarningRate } from '../db/types';

interface EarningRatesSectionProps {
  earningRates: EarningRate[];
}

export function EarningRatesSection({ earningRates }: EarningRatesSectionProps) {
  const now = useCurrentDate();
  return (
    <div className="glass-card mt-md">
      <div className="section-header">
        <h3 className="section-title">Earning Rates</h3>
      </div>
      {earningRates.map((rate, i) => {
        const quarter = currentQuarterRewards(rate, now);
        return (
          <div key={i} className="earning-rate">
            <div className="earning-multiplier">{rate.multiplier}x</div>
            <div className="earning-category">{rate.category}
              {rate.quarterlySchedule && (
                <div className="text-sm mt-sm" data-testid="quarterly-categories">
                  {quarter ? (
                    <>
                      <div>Q{Math.floor((Number(quarter.start.slice(5, 7)) - 1) / 3) + 1} {quarter.start.slice(0, 4)}: {quarter.categories.join(', ')}</div>
                      <div>{quarter.start} – {quarter.end} · Activate by {quarter.activationDeadline}</div>
                      <a href={quarter.source} target="_blank" rel="noopener noreferrer">Chase categories & activation ↗</a>
                    </>
                  ) : (
                    <div>Current quarter categories not available. <a href="https://www.chase.com/personal/credit-cards/freedom/freedomfive" target="_blank" rel="noopener noreferrer">Check Chase ↗</a></div>
                  )}
                </div>
              )}
            </div>
            {rate.limit && <div className="earning-limit">{rate.limit}</div>}
          </div>
        );
      })}
    </div>
  );
}
