import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { useNavigate } from 'react-router-dom';
import type { SignupBonus, UserPerk } from '../db/types';

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCurrency(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const cards = useLiveQuery(() => db.cards.where('status').equals('active').toArray());
  const bonuses = useLiveQuery(() => db.signupBonuses.toArray());
  const perks = useLiveQuery(() => db.perks.toArray());

  const activeCards = cards?.length ?? 0;
  const activeBonuses = bonuses?.filter((b: SignupBonus) => !b.completed) ?? [];
  const unusedPerks = perks?.filter((p: UserPerk) => !p.used && p.annualValue > 0 && p.renewalPeriod !== 'ongoing' && p.renewalPeriod !== 'one-time') ?? [];
  const totalPerkValue = unusedPerks.reduce((sum: number, p: UserPerk) => sum + (p.periodValue ?? p.annualValue), 0);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/cards')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{activeCards}</div>
          <div className="stat-label">Active Cards</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/perks')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">${totalPerkValue}</div>
          <div className="stat-label">Unused Perks Value</div>
        </div>
      </div>

      {activeBonuses.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Active Sign-up Bonuses</span>
          </div>
          {activeBonuses.map((bonus: SignupBonus) => {
            const template = getCardTemplate(bonus.cardTemplateId);
            const pct = Math.min(100, (bonus.currentSpend / bonus.targetSpend) * 100);
            const days = daysUntil(bonus.deadline);
            return (
              <div key={bonus.id} className="glass-card" onClick={() => navigate(`/card/${bonus.cardId}`)} style={{ cursor: 'pointer' }}>
                <div className="flex justify-between items-center mb-md">
                  <div>
                    <div className="font-bold">{template?.name}</div>
                    <div className="text-sm text-muted">
                      {formatCurrency(bonus.bonusPoints)} {bonus.bonusUnit}
                    </div>
                  </div>
                  <span className={`countdown ${days <= 30 ? 'urgent' : ''}`}>
                    {days > 0 ? `${days}d left` : 'Expired'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-bar-fill ${pct >= 100 ? 'complete' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-sm text-xs text-muted">
                  <span>${bonus.currentSpend.toLocaleString()} / ${bonus.targetSpend.toLocaleString()}</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {unusedPerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">Unused Perks This Period</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/perks')}>View All</button>
          </div>
          {unusedPerks.slice(0, 5).map((perk: UserPerk) => (
            <div key={perk.id} className="perk-item" onClick={() => navigate(`/card/${perk.cardId}`)}>
              <div className="perk-info">
                <div className="perk-name">{perk.perkName}</div>
                <div className="perk-desc">{perk.renewalPeriod}</div>
              </div>
              {perk.periodValue ? (
                <div style={{ textAlign: 'right' }}>
                  <div className="perk-value">${perk.periodValue}</div>
                  <div className="perk-period">/{perk.renewalPeriod === 'monthly' ? 'mo' : perk.renewalPeriod === 'quarterly' ? 'qtr' : 'period'}</div>
                </div>
              ) : perk.annualValue > 0 ? (
                <div className="perk-value">${perk.annualValue}</div>
              ) : null}
            </div>
          ))}
          {unusedPerks.length > 5 && (
            <div className="text-sm text-muted mt-sm" style={{ textAlign: 'center' }}>
              +{unusedPerks.length - 5} more unused perks
            </div>
          )}
        </>
      )}

      {activeCards === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <div className="empty-state-text">No cards added yet. Browse the catalog to get started!</div>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse Card Catalog</button>
        </div>
      )}
    </div>
  );
}
