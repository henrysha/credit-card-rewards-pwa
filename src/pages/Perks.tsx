import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { togglePerk, daysUntilDate, getCardTemplate } from '../db/helpers';
import { PerkDetailsModal } from '../components/PerkDetailsModal';
import { InfoIcon } from '../components/InfoIcon';
import { useState } from 'react';

import type { UserPerk, PerkTemplate } from '../db/types';

function getUrgencyBadge(perk: UserPerk): { label: string; className: string } | null {
  if (perk.used) return null;
  if (perk.renewalPeriod === 'ongoing' || perk.renewalPeriod === 'one-time') return null;
  const daysLeft = daysUntilDate(perk.currentPeriodEnd);
  if (daysLeft < 0) return null;
  if (daysLeft === 0) return { label: 'Expires today', className: 'badge-urgent' };
  if (daysLeft === 1) return { label: 'Expires tomorrow', className: 'badge-urgent' };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, className: 'badge-urgent' };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, className: 'badge-warning' };
  return null;
}

export default function Perks() {
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('unused');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedPerkTemplate, setSelectedPerkTemplate] = useState<PerkTemplate | null>(null);

  const perks = useLiveQuery(() => db.perks.toArray());
  const cards = useLiveQuery(() => db.cards.toArray());

  const cardNameMap = new Map<number, string>();
  const perkTemplateMap = new Map<string, PerkTemplate>();
  
  cards?.forEach(c => {
    const t = getCardTemplate(c.cardTemplateId);
    cardNameMap.set(c.id!, c.nickname || t?.name || 'Unknown');
    t?.perks.forEach(p => perkTemplateMap.set(p.id, p));
  });

  let filtered = (perks ?? []).filter((p: UserPerk) => p.annualValue > 0 && p.renewalPeriod !== 'ongoing');

  if (filter === 'unused') filtered = filtered.filter((p: UserPerk) => !p.used);
  else if (filter === 'used') filtered = filtered.filter((p: UserPerk) => p.used);

  if (periodFilter !== 'all') {
    filtered = filtered.filter((p: UserPerk) => p.renewalPeriod === periodFilter);
  }

  // Group by renewal period
  const grouped = new Map<string, UserPerk[]>();
  const periodOrder = ['monthly', 'quarterly', 'semi-annual', 'annual', 'every-4-years', 'one-time'];
  periodOrder.forEach(p => grouped.set(p, []));
  filtered.forEach((p: UserPerk) => {
    const arr = grouped.get(p.renewalPeriod) ?? [];
    arr.push(p);
    grouped.set(p.renewalPeriod, arr);
  });

  const periodLabels: Record<string, string> = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-Annual',
    'annual': 'Annual',
    'every-4-years': 'Every 4 Years',
    'one-time': 'One-Time',
  };

  const totalValue = filtered.filter((p: UserPerk) => !p.used).reduce((s: number, p: UserPerk) => s + (p.periodValue ?? p.annualValue), 0);

  const handleInfoClick = (e: React.MouseEvent, pt: PerkTemplate | undefined) => {
    e.stopPropagation();
    if (pt) {
      setSelectedPerkTemplate(pt);
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Perks</h1>
        <span className="badge badge-gold">${totalValue} unclaimed</span>
      </div>

      <div className="tabs">
        {(['unused', 'all', 'used'] as const).map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'unused' ? 'Unused' : f === 'all' ? 'All' : 'Used'}
          </button>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab ${periodFilter === 'all' ? 'active' : ''}`} onClick={() => setPeriodFilter('all')}>All Periods</button>
        {periodOrder.map(p => {
          const count = (perks ?? []).filter((pk: UserPerk) => pk.renewalPeriod === p && pk.annualValue > 0).length;
          if (count === 0) return null;
          return (
            <button key={p} className={`tab ${periodFilter === p ? 'active' : ''}`} onClick={() => setPeriodFilter(p)}>
              {periodLabels[p]}
            </button>
          );
        })}
      </div>

      {periodOrder.map(period => {
        const items = grouped.get(period) ?? [];
        if (items.length === 0 || (periodFilter !== 'all' && periodFilter !== period)) return null;
        return (
          <div key={period}>
            <div className="section-header">
              <span className="section-title">{periodLabels[period]}</span>
              <span className="text-xs text-muted">{items.length} perks</span>
            </div>
            {items.map((perk: UserPerk) => {
              const urgency = getUrgencyBadge(perk);
              const pt = perkTemplateMap.get(perk.perkTemplateId);
              const hasExtraInfo = !!(pt && (pt.details || pt.usageLink));

              return (
                <div key={perk.id} className={`perk-item ${perk.used ? 'used' : ''}`}>
                  <div className="perk-main-action" onClick={() => togglePerk(perk.id!)}>
                    <div className={`perk-checkbox ${perk.used ? 'checked' : ''}`}>
                      {perk.used && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div className="perk-info" style={{ flex: 1 }}>
                      <div className="perk-name flex items-center gap-sm">
                        {perk.perkName}
                        {urgency && <span className={`badge ${urgency.className}`}>{urgency.label}</span>}
                      </div>
                      <div className="perk-desc">{cardNameMap.get(perk.cardId) || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {perk.periodValue ? (
                        <>
                          <div className="perk-value">${perk.periodValue}</div>
                          <div className="perk-period">/{period === 'monthly' ? 'mo' : period === 'quarterly' ? 'qtr' : period === 'semi-annual' ? '6mo' : 'yr'}</div>
                        </>
                      ) : (
                        <div className="perk-value">${perk.annualValue}</div>
                      )}
                    </div>
                  </div>
                  {hasExtraInfo && (
                    <button 
                      className="info-btn" 
                      onClick={(e) => handleInfoClick(e, pt)}
                      aria-label="Perk Info"
                    >
                      <InfoIcon width={20} height={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-text">
            {filter === 'unused' ? 'All perks claimed! Nice work.' : 'No perks to show.'}
          </div>
        </div>
      )}

      {selectedPerkTemplate && (
        <PerkDetailsModal
          template={selectedPerkTemplate}
          onClose={() => setSelectedPerkTemplate(null)}
        />
      )}
    </div>
  );
}

