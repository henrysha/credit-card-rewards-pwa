import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate, getCardsOpenedInLast24Months, getSignupBonusEligibility } from '../db/helpers';
import { churningRules } from '../db/seed-data';
import { useState, useEffect } from 'react';
import type { UserCard, ChurningRule } from '../db/types';
import HotelFamilyEligibility from '../components/HotelFamilyEligibility';

function monthsSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
}

export default function Churning() {
  const cards = useLiveQuery(() => db.cards.toArray());
  const [fiveOfTwentyFour, setFiveOfTwentyFour] = useState(0);

  useEffect(() => {
    getCardsOpenedInLast24Months().then(setFiveOfTwentyFour);
  }, [cards]);

  // Keep the U.S. Bank status aligned with the same family-history check used
  // by the signup-bonus tracker. The rule owns the participating products, so
  // adding a product to the family does not require a second list here.
  const skypassBonusEligible = useLiveQuery(async () => {
    const rule = churningRules.find(r => r.id === 'usbank-skypass-family');
    const affectedCards = rule?.affectedCards ?? [];
    if (affectedCards.length === 0) return true;
    const results = await Promise.all(affectedCards.map(getSignupBonusEligibility));
    return results.every(result => result.eligible);
  }, []);

  const issuerGroups = ['Chase', 'Amex', 'Capital One', 'Citi', 'U.S. Bank'] as const;
  const getLastOpenedByIssuer = (issuer: string): UserCard | undefined => {
    if (!cards) return undefined;
    const issuerCards = cards
      .filter(c => {
        const t = getCardTemplate(c.cardTemplateId);
        return t?.issuer === issuer;
      })
      .sort((a, b) => new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime());
    return issuerCards[0];
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Churning</h1>
      </div>

      {/* 5/24 Counter */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800 }}>
          <span style={{ color: fiveOfTwentyFour >= 5 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {fiveOfTwentyFour}
          </span>
          <span className="text-muted">/5</span>
        </div>
        <div className="text-sm text-muted mt-sm">Cards opened in last 24 months</div>
        <div className="mt-sm">
          {fiveOfTwentyFour < 5 ? (
            <span className="badge badge-green">✓ Under 5/24 — Eligible for Chase</span>
          ) : (
            <span className="badge badge-red">✗ Over 5/24 — Chase will likely deny</span>
          )}
        </div>
      </div>

      {/* Per-issuer status */}
      <div className="section-header mt-lg">
        <span className="section-title">Issuer Eligibility</span>
      </div>

      {issuerGroups.map(issuer => {
        const lastCard = getLastOpenedByIssuer(issuer);
        const rules = churningRules.filter((r: ChurningRule) => r.issuer === issuer);
        const months = lastCard ? monthsSince(lastCard.openedDate) : 999;

        let eligible = true;
        let cooldownRemaining = 0;

        if (issuer === 'Chase' && fiveOfTwentyFour >= 5) eligible = false;
        if (issuer === 'U.S. Bank' && skypassBonusEligible === false) eligible = false;
        if (issuer === 'Capital One' && lastCard && months < 6) {
          eligible = false;
          cooldownRemaining = 6 - months;
        }

        return (
          <div key={issuer} className="glass-card">
            <div className="flex justify-between items-center mb-md">
              <h3>{issuer}</h3>
              {eligible ? (
                <span className="badge badge-green">Eligible</span>
              ) : (
                <span className="badge badge-red">
                  {cooldownRemaining > 0
                    ? `${cooldownRemaining}mo cooldown`
                    : issuer === 'U.S. Bank'
                      ? 'SKYPASS bonus ineligible'
                      : 'Restricted'}
                </span>
              )}
            </div>
            {lastCard && (
              <div className="text-sm text-muted mb-md">
                Last opened: {getCardTemplate(lastCard.cardTemplateId)?.name} ({months}mo ago)
              </div>
            )}
            {rules.map((rule: ChurningRule) => (
              <div key={rule.id} className="rule-card">
                <div className="rule-name">{rule.ruleName}</div>
                <div className="rule-desc">{rule.description}</div>
              </div>
            ))}
          </div>
        );
      })}

      <HotelFamilyEligibility cards={cards ?? []} />
    </div>
  );
}
