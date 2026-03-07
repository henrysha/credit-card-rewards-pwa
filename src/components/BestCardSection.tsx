import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { getBestCardPerCategory } from '../utils/rewards';
import { useNavigate } from 'react-router-dom';

export function BestCardSection() {
  const navigate = useNavigate();
  const userCards = useLiveQuery(() => db.cards.where('status').equals('active').toArray());
  
  const templates = (userCards ?? []).map(uc => {
    const t = getCardTemplate(uc.cardTemplateId);
    return t!;
  }).filter(Boolean);

  const bestCards = getBestCardPerCategory(templates).filter(result => result.multiplier > 0);

  if (templates.length === 0 || bestCards.length === 0) return null;

  return (
    <div className="mt-md">
      <div className="section-header mb-sm">
        <span className="section-title text-sm opacity-70">Best Card by Category</span>
      </div>

      <div className="flex flex-col gap-[6px]">
        {bestCards.map((result) => (
          <div 
            key={result.category} 
            data-category={result.category}
            className="glass-card best-card-row p-[6px] px-sm"
            onClick={() => result.cardTemplateId && navigate(`/catalog`)}
            style={{ cursor: result.cardTemplateId ? 'pointer' : 'default' }}
          >
            <div className="text-base font-bold text-white leading-tight truncate">{result.category}</div>
            <div className="text-base text-secondary font-medium truncate">{result.cardName}</div>
            <div className="flex flex-col items-end min-w-[50px]">
              <div className="text-xl font-black text-gold leading-none">{result.multiplier}x</div>
              {result.limit && (
                <div className="text-[10px] text-muted leading-none mt-1 text-right">
                  {result.limit}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-sm p-sm glass-card" style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
        <p className="text-[11px] text-secondary leading-tight">
          <span className="text-gold font-bold">Smart Analysis:</span> We suggest your active card with the highest multiplier, including rotating and top-category bonuses.
        </p>
      </div>
    </div>
  );
}
