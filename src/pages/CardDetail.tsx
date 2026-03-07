import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate, togglePerk, updateBonusSpend, removeCard } from '../db/helpers';
import { useState } from 'react';
import type { UserPerk, PerkTemplate } from '../db/types';
import { PerkDetailsModal } from '../components/PerkDetailsModal';
import { InfoIcon } from '../components/InfoIcon';

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cardId = Number(id);

  const card = useLiveQuery(() => db.cards.get(cardId), [cardId]);
  const bonus = useLiveQuery(() => db.signupBonuses.where('cardId').equals(cardId).first(), [cardId]);
  const perks = useLiveQuery(() => db.perks.where('cardId').equals(cardId).toArray(), [cardId]);

  const [editingSpend, setEditingSpend] = useState(false);
  const [spendValue, setSpendValue] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPerkTemplate, setSelectedPerkTemplate] = useState<PerkTemplate | null>(null);

  if (!card) return <div className="page"><p className="text-muted">Loading...</p></div>;

  const template = getCardTemplate(card.cardTemplateId);
  if (!template) return <div className="page"><p className="text-muted">Card template not found.</p></div>;

  const valuablePerks = perks?.filter((p: UserPerk) => p.annualValue > 0) ?? [];
  const otherPerks = perks?.filter((p: UserPerk) => p.annualValue === 0) ?? [];

  const handleToggle = async (perkId: number) => {
    await togglePerk(perkId);
  };

  const handleSpendUpdate = async () => {
    if (bonus?.id) {
      await updateBonusSpend(bonus.id, parseFloat(spendValue) || 0);
      setEditingSpend(false);
    }
  };

  const handleDelete = async () => {
    await removeCard(cardId);
    navigate('/cards');
  };

  const perkTemplateMap = new Map<string, PerkTemplate>();
  template.perks.forEach(p => perkTemplateMap.set(p.id, p));

  const handleInfoClick = (e: React.MouseEvent, pt: PerkTemplate | undefined) => {
    e.stopPropagation();
    if (pt) {
      setSelectedPerkTemplate(pt);
    }
  };

  return (
    <div className="page animate-in">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="card-tile mt-sm" style={{ background: template.color }}>
        <div className="card-issuer">{template.issuer}</div>
        <div className="card-name">{card.nickname || template.name}</div>
        <div className="card-fee">${template.annualFee}/yr</div>
        {card.lastFourDigits && <div className="card-last-four">•••• {card.lastFourDigits}</div>}
      </div>

      {/* Signup Bonus */}
      {bonus && !bonus.completed && (
        <div className="glass-card mt-md">
          <div className="flex justify-between items-center mb-md">
            <h3>Sign-up Bonus</h3>
            <span className={`countdown ${daysUntil(bonus.deadline) <= 30 ? 'urgent' : ''}`}>
              {daysUntil(bonus.deadline) > 0 ? `${daysUntil(bonus.deadline)}d left` : 'Expired'}
            </span>
          </div>
          <div className="text-sm text-muted mb-md">
            Spend ${bonus.targetSpend.toLocaleString()} to earn {bonus.bonusPoints.toLocaleString()} {bonus.bonusUnit}
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${bonus.currentSpend >= bonus.targetSpend ? 'complete' : ''}`}
              style={{ width: `${Math.min(100, (bonus.currentSpend / bonus.targetSpend) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-sm">
            <span className="text-sm">${bonus.currentSpend.toLocaleString()} / ${bonus.targetSpend.toLocaleString()}</span>
            {editingSpend ? (
              <div className="flex gap-sm items-center">
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 100, padding: '4px 8px', fontSize: '0.8rem' }}
                  value={spendValue}
                  onChange={e => setSpendValue(e.target.value)}
                  placeholder="Amount"
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleSpendUpdate}>Save</button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSpendValue(String(bonus.currentSpend)); setEditingSpend(true); }}>
                Update Spend
              </button>
            )}
          </div>
        </div>
      )}

      {bonus?.completed && (
        <div className="glass-card mt-md" style={{ borderColor: 'var(--accent-green)' }}>
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <div className="font-bold text-green">Bonus Earned!</div>
              <div className="text-sm text-muted">{bonus.bonusPoints.toLocaleString()} {bonus.bonusUnit}</div>
            </div>
          </div>
        </div>
      )}

      {/* Earning Rates */}
      <div className="glass-card mt-md">
        <h3 className="mb-md">Earning Rates</h3>
        {template.earningRates.map((rate, i) => (
          <div key={i} className="earning-rate">
            <div className="earning-multiplier">{rate.multiplier}x</div>
            <div className="earning-category">{rate.category}</div>
            {rate.limit && <div className="earning-limit">{rate.limit}</div>}
          </div>
        ))}
      </div>

      {/* Valuable Perks (with dollar values) */}
      {valuablePerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">Credits & Perks</span>
            <span className="badge badge-gold">
              ${valuablePerks.filter((p: UserPerk) => !p.used).reduce((s: number, p: UserPerk) => s + (p.periodValue ?? p.annualValue), 0)} unclaimed
            </span>
          </div>
          {valuablePerks.map((perk: UserPerk) => {
            const pt = perkTemplateMap.get(perk.perkTemplateId);
            const hasExtraInfo = !!(pt && (pt.details || pt.usageLink));

            return (
              <div key={perk.id} className={`perk-item ${perk.used ? 'used' : ''}`}>
                <div className="perk-main-action" onClick={() => handleToggle(perk.id!)}>
                  <div className={`perk-checkbox ${perk.used ? 'checked' : ''}`}>
                    {perk.used && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div className="perk-info" style={{ flex: 1 }}>
                    <div className="perk-name flex items-center gap-sm">
                      {perk.perkName}
                    </div>
                    <div className="perk-desc">{pt?.description || ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {perk.periodValue ? (
                      <>
                        <div className="perk-value">${perk.periodValue}</div>
                        <div className="perk-period">/{perk.renewalPeriod === 'monthly' ? 'mo' : perk.renewalPeriod === 'quarterly' ? 'qtr' : perk.renewalPeriod === 'semi-annual' ? '6mo' : 'yr'}</div>
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
        </>
      )}

      {/* Other Perks (insurance, status, etc.) */}
      {otherPerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">Other Benefits</span>
          </div>
          {otherPerks.map((perk: UserPerk) => {
            const pt = perkTemplateMap.get(perk.perkTemplateId);
            const hasExtraInfo = !!(pt && (pt.details || pt.usageLink));

            return (
              <div key={perk.id} className={`perk-item ${perk.used ? 'used' : ''}`}>
                <div className="perk-main-action" onClick={() => handleToggle(perk.id!)}>
                  <div className={`perk-checkbox ${perk.used ? 'checked' : ''}`}>
                    {perk.used && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div className="perk-info" style={{ flex: 1 }}>
                    <div className="perk-name flex items-center gap-sm">
                      {perk.perkName}
                    </div>
                    <div className="perk-desc">{pt?.description || ''}</div>
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
        </>
      )}

      {/* Actions */}
      <div className="mt-lg">
        <button className="btn btn-danger btn-block" onClick={() => setShowDelete(true)}>Remove Card</button>
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Remove Card?</h3>
            <p className="text-sm text-muted mb-md">
              This will remove {template.name} and all its tracking data (bonus progress, perk history).
            </p>
            <div className="flex gap-sm">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Remove</button>
            </div>
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
