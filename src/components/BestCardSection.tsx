import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { getBestCardPerCategory } from '../utils/rewards';
import { useNavigate } from 'react-router-dom';

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-70 flex-shrink-0 mr-[4px]">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-70 flex-shrink-0 mr-[4px]">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export function BestCardSection() {
  const navigate = useNavigate();
  const userCards = useLiveQuery(() => db.cards.where('status').equals('active').toArray());
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  
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
        {bestCards.map((result) => {
          const hasSub = result.subCategories && result.subCategories.length > 0;
          const isExpanded = !!expandedCats[result.category];

          return (
            <div key={result.category} className="glass-card flex flex-col pt-0 pb-0 overflow-hidden">
              <div 
                data-category={result.category}
                className="best-card-row p-[6px] px-sm"
                onClick={() => {
                  if (hasSub) {
                    setExpandedCats(prev => ({...prev, [result.category]: !prev[result.category]}));
                  } else if (result.cardTemplateId) {
                    navigate(`/catalog`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center text-sm font-bold text-white leading-tight truncate">
                  {hasSub && (isExpanded ? <ChevronDown /> : <ChevronRight />)}
                  <span className="truncate">{result.category}</span>
                </div>
                <div className="text-sm text-secondary font-medium truncate mx-[8px]">{result.cardName}</div>
                <div className="flex flex-col justify-center items-end min-w-[40px] shrink-0" onClick={(e) => {
                   if (hasSub && result.cardTemplateId) {
                      e.stopPropagation();
                      navigate(`/catalog`);
                   }
                }}>
                  <div className="text-lg font-black text-gold leading-none">{result.multiplier}x</div>
                </div>
              </div>
              
              {hasSub && isExpanded && (
                <div className="flex flex-col mt-0 pb-[6px] px-[6px] border-t border-white/5 bg-black/10">
                  {result.subCategories!.map(subResult => (
                    <div 
                      key={subResult.category} 
                      data-category={subResult.category}
                      className="best-card-row p-[4px] px-[8px] mt-[4px] rounded hover:bg-white/5 transition-colors"
                      onClick={(e) => {
                          e.stopPropagation();
                          if (subResult.cardTemplateId) navigate(`/catalog`);
                      }}
                      style={{ cursor: subResult.cardTemplateId ? 'pointer' : 'default' }}
                    >
                      <div className="flex items-center text-xs font-bold text-white/90 leading-tight truncate relative pl-[16px]">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[1px] bg-white/20"></div>
                        <span className="truncate">{subResult.category}</span>
                      </div>
                      <div className="text-xs text-secondary/80 font-medium truncate mx-[8px]">{subResult.cardName}</div>
                      <div className="flex flex-col justify-center items-end min-w-[40px] shrink-0">
                        <div className="text-base font-black text-gold/90 leading-none">{subResult.multiplier}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-sm p-sm glass-card" style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
        <p className="text-[11px] text-secondary leading-tight">
          <span className="text-gold font-bold">Smart Analysis:</span> We suggest your active card with the highest multiplier, including rotating and top-category bonuses.
        </p>
      </div>
    </div>
  );
}
