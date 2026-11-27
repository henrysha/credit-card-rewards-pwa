import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate, getCardsOpenedInLast24Months, getSignupBonusEligibility } from '../db/helpers';
import { churningRules } from '../db/seed-data';
import { useState, useEffect } from 'react';
import type { UserCard, ChurningRule } from '../db/types';
import HotelFamilyEligibility from '../components/HotelFamilyEligibility';
import BankOfAmericaEligibility from '../components/BankOfAmericaEligibility';

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

  const skypassBonusEligible = useLiveQuery(async () => {
    const rule = churningRules.find(r => r.id === 'usbank-skypass-family');
    const affectedCards = rule?.affectedCards ?? [];
    if (affectedCards.length === 0) return true;
    const results = await Promise.all(affectedCards.map(getSignupBonusEligibility));
    return results.every(result => result.eligible);
  }, []);

  const leftIssuers = ['Chase', 'Amex'] as const;
  const rightIssuers = ['Capital One', 'Citi', 'U.S. Bank', 'Bilt'] as const;

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

  const renderIssuerCard = (issuer: string) => {
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
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Churning</h1>
      </div>

      <div className="churning-duo-board">
        <div className="churning-left-pane">
          {/* 5/24 Counter */}
          <div className="glass-card churning-hero-card">
            <div className="churning-hero-count">
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

          <HotelFamilyEligibility cards={cards ?? []} />

          <div className="section-header mt-lg">
            <span className="section-title">Primary Issuer Rules</span>
          </div>
          <div className="churning-issuer-grid">
            {leftIssuers.map(renderIssuerCard)}
          </div>
        </div>

        <div className="churning-right-pane">
          <div className="section-header mt-lg">
            <span className="section-title">Issuer Eligibility</span>
          </div>
          <div className="churning-issuer-grid">
            {rightIssuers.map(renderIssuerCard)}
            <BankOfAmericaEligibility cards={cards} />
          </div>
        </div>
      </div>
    </div>
  );
}
