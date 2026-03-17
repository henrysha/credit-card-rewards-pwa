import type { EarningRate } from '../db/types';

interface EarningRatesSectionProps {
  earningRates: EarningRate[];
}

export function EarningRatesSection({ earningRates }: EarningRatesSectionProps) {
  return (
    <div className="glass-card mt-md">
      <h3 className="mb-md">Earning Rates</h3>
      {earningRates.map((rate, i) => (
        <div key={i} className="earning-rate">
          <div className="earning-multiplier">{rate.multiplier}x</div>
          <div className="earning-category">{rate.category}</div>
          {rate.limit && <div className="earning-limit">{rate.limit}</div>}
        </div>
      ))}
    </div>
  );
}
