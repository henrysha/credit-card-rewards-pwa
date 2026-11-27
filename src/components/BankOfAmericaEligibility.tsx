import { checkPreviousCardholderHistory, getCardTemplate } from '../db/helpers';
import { churningRules } from '../db/seed-data';
import type { UserCard } from '../db/types';
import { useCurrentDate } from '../hooks/useCurrentDate';
import { formatDateLabel, getLocalDateString } from '../utils/quarterly-rewards';

export default function BankOfAmericaEligibility({ cards }: { cards: UserCard[] | undefined }) {
  const today = getLocalDateString(useCurrentDate());
  const rules = churningRules.filter(rule => rule.issuer === 'Bank of America');

  return (
    <section className="glass-card" aria-labelledby="boa-eligibility">
      <h3 id="boa-eligibility" className="mb-md">Bank of America</h3>
      {rules.map(rule => {
        const [cardId] = rule.affectedCards ?? [];
        const termsUrl = cardId ? getCardTemplate(cardId)?.signupBonus.termsUrl : undefined;
        const sourceUrl = termsUrl ?? rule.sourceUrl;
        const result = cardId && cards && rule.historyCheck === 'same-card-held' && rule.cooldownMonths !== undefined
          ? checkPreviousCardholderHistory(cardId, rule.cooldownMonths, cards, today)
          : undefined;

        return (
          <div key={rule.id} className="rule-card">
            <div className="rule-name">{rule.ruleName}</div>
            <div className="rule-desc">{rule.description}</div>
            {result && (
              <div className="mt-sm">
                <span className={`badge ${result.history.length ? 'badge-red' : 'badge-green'}`}>
                  {result.currentlyHeld
                    ? 'Ascent currently held'
                    : result.missingClosureDate
                      ? 'Ascent closure date needed'
                      : result.reviewOn
                        ? `Ascent lookback ends ${formatDateLabel(result.reviewOn)}`
                        : 'No Ascent hold in the lookback'}
                </span>
              </div>
            )}
            {sourceUrl && (
              <a className="text-sm" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {termsUrl ? 'View Bank of America offer terms' : 'Read the reported approval limits'}
              </a>
            )}
          </div>
        );
      })}
    </section>
  );
}
