import { useCurrentDate } from '../hooks/useCurrentDate';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { getBestCardPerCategory } from '../utils/rewards';
import { useNavigate } from 'react-router-dom';
import type { CardTemplate } from '../db/types';

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="best-card-chevron">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="best-card-chevron">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export function BestCardSection() {
  const now = useCurrentDate();
  const navigate = useNavigate();
  const userCards = useLiveQuery(() => db.cards.where('status').equals('active').toArray());
  const activeQuarterlyRewards = useLiveQuery(() => db.quarterlyRewards.where('status').equals('active').toArray());
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const templates = (userCards ?? []).map(uc => {
    const t = getCardTemplate(uc.cardTemplateId);
    if (!t) return null;
    const cardRewards = (activeQuarterlyRewards ?? []).filter(r => r.cardId === uc.id);
    if (cardRewards.length === 0) return t;
    return {
      ...t,
      earningRates: [
        ...t.earningRates,
        ...cardRewards.map(r => ({
          category: r.category,
          multiplier: r.multiplier,
          limit: r.limit,
        }))
      ]
    };
  }).filter((t): t is CardTemplate => Boolean(t));

  const bestCards = getBestCardPerCategory(templates, now).filter(result => result.multiplier > 0);

  const quarterlyTerms = [...new Set(bestCards.map(result => result.limit).filter((limit): limit is string => Boolean(limit?.startsWith('If activated'))))];

  const navigateToOwnedCard = (cardTemplateId: string) => {
    const card = userCards?.find(userCard => userCard.cardTemplateId === cardTemplateId);
    if (card?.id !== undefined) navigate(`/card/${card.id}`);
  };

  if (templates.length === 0 || bestCards.length === 0) return null;

  return (
    <div className="mt-md" id="dashboard-best-card">
      <div className="section-header mb-sm">
        <span className="section-title">Best Card by Category</span>
      </div>

      <div className="best-card-list">
        {bestCards.map((result) => {
          const hasSub = result.subCategories && result.subCategories.length > 0;
          const isExpanded = !!expandedCats[result.category];

          return (
            <div key={result.category} className="glass-card best-card-item">
              <div
                data-category={result.category}
                className="best-card-row"
                onClick={() => {
                  if (hasSub) {
                    setExpandedCats(prev => ({ ...prev, [result.category]: !prev[result.category] }));
                  } else if (result.cardTemplateId) {
                    navigateToOwnedCard(result.cardTemplateId);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="best-card-category-cell">
                  {hasSub && (isExpanded ? <ChevronDown /> : <ChevronRight />)}
                  <span>{result.category}</span>
                </div>
                <div className="best-card-name-cell">{result.cardName}</div>
                <div
                  className="best-card-mult-cell"
                  onClick={(e) => {
                    if (hasSub && result.cardTemplateId) {
                      e.stopPropagation();
                      navigateToOwnedCard(result.cardTemplateId);
                    }
                  }}
                >
                  <div className="text-lg font-black text-gold">{result.multiplier}x</div>
                </div>
              </div>

              {hasSub && isExpanded && (
                <div className="best-card-sublist">
                  {result.subCategories!.map(subResult => (
                    <div
                      key={subResult.category}
                      data-category={subResult.category}
                      className="best-card-row best-card-subrow"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (subResult.cardTemplateId) navigateToOwnedCard(subResult.cardTemplateId);
                      }}
                      style={{ cursor: subResult.cardTemplateId ? 'pointer' : 'default' }}
                    >
                      <div className="best-card-subcategory-cell">
                        <div className="best-card-sub-dash"></div>
                        <span>{subResult.category}</span>
                      </div>
                      <div className="text-xs text-secondary font-medium">{subResult.cardName}</div>
                      <div className="best-card-mult-cell">
                        <div className="text-base font-black text-gold">{subResult.multiplier}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {quarterlyTerms.length > 0 && (
        <div className="quarterly-terms" data-testid="quarterly-recommendation-terms">
          {quarterlyTerms.map(terms => <div key={terms}>Quarterly bonus: {terms}</div>)}
        </div>
      )}

      <div className="glass-card best-card-smart-note">
        <p>
          <span className="text-gold font-bold">Smart Analysis:</span> We suggest your active card with the highest multiplier, including rotating and top-category bonuses.
        </p>
      </div>
    </div>
  );
}
