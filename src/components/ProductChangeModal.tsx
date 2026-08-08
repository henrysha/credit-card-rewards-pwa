import { useState } from 'react';
import type { UserCard, CardTemplate } from '../db/types';
import { getEligibleProductChangeTemplates, productChangeCard } from '../db/helpers';
import { useToast } from './ToastContext';

interface ProductChangeModalProps {
  card: UserCard;
  currentTemplate: CardTemplate;
  onClose: () => void;
  onSuccess: (newCardId: number, targetTemplate: CardTemplate) => void;
}

export function ProductChangeModal({
  card,
  currentTemplate,
  onClose,
  onSuccess,
}: ProductChangeModalProps) {
  const { showToast } = useToast();
  const { upgrades, downgrades, sameTier, allEligible } = getEligibleProductChangeTemplates(currentTemplate.id);

  const [selectedTab, setSelectedTab] = useState<'all' | 'upgrades' | 'downgrades' | 'sameTier'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  
  // Customization fields for the target card
  const [nickname, setNickname] = useState(card.nickname || '');
  const [lastFour, setLastFour] = useState(card.lastFourDigits || '');
  const [annualFeeDate, setAnnualFeeDate] = useState(card.annualFeeDate || '');
  const [submitting, setSubmitting] = useState(false);

  const displayedTemplates = selectedTab === 'upgrades'
    ? upgrades
    : selectedTab === 'downgrades'
    ? downgrades
    : selectedTab === 'sameTier'
    ? sameTier
    : allEligible;

  const handleConfirmProductChange = async () => {
    if (!selectedTemplate || !card.id) return;
    setSubmitting(true);
    try {
      const newCardId = await productChangeCard(card.id, selectedTemplate.id, {
        nickname: nickname.trim() || undefined,
        lastFourDigits: lastFour.trim() || undefined,
        annualFeeDate: annualFeeDate || undefined,
      });

      const isUpgrade = selectedTemplate.annualFee > currentTemplate.annualFee;
      const isDowngrade = selectedTemplate.annualFee < currentTemplate.annualFee;
      const actionType = isUpgrade ? 'Upgraded' : isDowngrade ? 'Downgraded' : 'Product changed';

      showToast(`${actionType} to ${selectedTemplate.name}!`);
      onSuccess(newCardId, selectedTemplate);
    } catch (err) {
      console.error('Error during product change:', err);
      showToast('Failed to product change card');
    } finally {
      setSubmitting(false);
    }
  };

  const feeDifference = selectedTemplate
    ? selectedTemplate.annualFee - currentTemplate.annualFee
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-handle" />

        {!selectedTemplate ? (
          <>
            <div className="flex justify-between items-center mb-sm">
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Product Change / Upgrade</h3>
                <div className="text-xs text-muted mt-xs">
                  Switch <span className="font-bold text-white">{currentTemplate.name}</span> to another {currentTemplate.issuer} card
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {allEligible.length === 0 ? (
              <div className="p-lg text-center text-muted">
                <p>No other cards from {currentTemplate.issuer} are available for product change in the catalog.</p>
                <button className="btn btn-secondary mt-md" onClick={onClose}>Close</button>
              </div>
            ) : (
              <>
                <div className="tabs mb-md" style={{ marginBottom: 12 }}>
                  <button
                    className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('all')}
                  >
                    All ({allEligible.length})
                  </button>
                  {upgrades.length > 0 && (
                    <button
                      className={`tab ${selectedTab === 'upgrades' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('upgrades')}
                    >
                      Upgrades ({upgrades.length})
                    </button>
                  )}
                  {downgrades.length > 0 && (
                    <button
                      className={`tab ${selectedTab === 'downgrades' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('downgrades')}
                    >
                      Downgrades ({downgrades.length})
                    </button>
                  )}
                  {sameTier.length > 0 && (
                    <button
                      className={`tab ${selectedTab === 'sameTier' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('sameTier')}
                    >
                      Same Tier ({sameTier.length})
                    </button>
                  )}
                </div>

                <div className="catalog-list" style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                  {displayedTemplates.map(targetTemplate => {
                    const diff = targetTemplate.annualFee - currentTemplate.annualFee;
                    const isUpgrade = diff > 0;
                    const isDowngrade = diff < 0;

                    return (
                      <div
                        key={targetTemplate.id}
                        className="glass-card"
                        style={{
                          cursor: 'pointer',
                          padding: '12px 14px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => {
                          setSelectedTemplate(targetTemplate);
                          setNickname(targetTemplate.name);
                        }}
                      >
                        <div className="flex items-center gap-md">
                          <div
                            style={{
                              width: 44,
                              height: 28,
                              borderRadius: 4,
                              background: targetTemplate.color,
                              flexShrink: 0,
                              position: 'relative',
                              overflow: 'hidden',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="font-bold flex items-center gap-xs" style={{ fontSize: '0.88rem' }}>
                              <span>{targetTemplate.name}</span>
                              {targetTemplate.isBusinessCard && (
                                <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>Business</span>
                              )}
                            </div>
                            <div className="text-xs text-muted">
                              ${targetTemplate.annualFee}/yr • {targetTemplate.perks.length} perks
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {isUpgrade && (
                              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                                +${diff}/yr Upgrade
                              </span>
                            )}
                            {isDowngrade && (
                              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                                -${Math.abs(diff)}/yr Downgrade
                              </span>
                            )}
                            {diff === 0 && (
                              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                                Same Fee ($0)
                              </span>
                            )}
                          </div>
                        </div>

                        {targetTemplate.perks.filter(p => p.annualValue > 0).length > 0 && (
                          <div className="mt-xs" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {targetTemplate.perks
                              .filter(p => p.annualValue > 0)
                              .slice(0, 3)
                              .map(p => (
                                <span key={p.id} className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                  {p.name}
                                </span>
                              ))}
                            {targetTemplate.perks.filter(p => p.annualValue > 0).length > 3 && (
                              <span className="badge" style={{ fontSize: '0.62rem', padding: '1px 5px', opacity: 0.7 }}>
                                +{targetTemplate.perks.filter(p => p.annualValue > 0).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          /* Confirmation & Review Screen */
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
            <button
              className="btn btn-secondary btn-sm mb-md"
              onClick={() => setSelectedTemplate(null)}
              disabled={submitting}
            >
              ← Back to Card Options
            </button>

            <div className="flex items-center justify-between mb-sm">
              <h3 style={{ fontSize: '1.2rem' }}>
                {feeDifference > 0 ? 'Confirm Card Upgrade' : feeDifference < 0 ? 'Confirm Card Downgrade' : 'Confirm Product Change'}
              </h3>
              {feeDifference > 0 ? (
                <span className="badge badge-green">Upgrade</span>
              ) : feeDifference < 0 ? (
                <span className="badge badge-blue">Downgrade</span>
              ) : (
                <span className="badge badge-gold">Lateral Change</span>
              )}
            </div>

            {/* Visual Card Comparison */}
            <div className="glass-card mb-md" style={{ padding: '16px' }}>
              <div className="flex items-center justify-between gap-sm mb-md">
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div className="text-xs text-muted mb-xs">Current Card</div>
                  <div className="font-bold text-sm">{currentTemplate.name}</div>
                  <div className="text-xs text-muted mt-xs">${currentTemplate.annualFee}/yr</div>
                </div>

                <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>➔</div>

                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-xs text-gold mb-xs font-bold">New Card</div>
                  <div className="font-bold text-sm">{selectedTemplate.name}</div>
                  <div className="text-xs text-gold mt-xs font-bold">${selectedTemplate.annualFee}/yr</div>
                </div>
              </div>

              {/* Annual Fee Impact Callout */}
              <div
                className="p-sm text-xs rounded mb-sm"
                style={{
                  background: feeDifference > 0 ? 'rgba(74, 222, 128, 0.1)' : feeDifference < 0 ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${feeDifference > 0 ? 'rgba(74, 222, 128, 0.2)' : feeDifference < 0 ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                }}
              >
                {feeDifference > 0 ? (
                  <span>
                    📈 <strong>Annual fee will increase by ${feeDifference}/yr</strong> (${currentTemplate.annualFee} $\rightarrow$ ${selectedTemplate.annualFee}).
                  </span>
                ) : feeDifference < 0 ? (
                  <span>
                    📉 <strong>Annual fee will decrease by ${Math.abs(feeDifference)}/yr</strong> (${currentTemplate.annualFee} $\rightarrow$ ${selectedTemplate.annualFee}).
                  </span>
                ) : (
                  <span>
                    🔄 <strong>No change in annual fee</strong> (${currentTemplate.annualFee}/yr).
                  </span>
                )}
              </div>

              {/* Account Continuity Info */}
              <ul className="text-xs text-muted" style={{ paddingLeft: '16px', margin: '8px 0', lineHeight: 1.6 }}>
                <li>Account age (opened on <strong>{card.openedDate}</strong>) is preserved.</li>
                <li>Previous card moves to <em>Closed / Product Changed</em> history.</li>
                <li>New perks & earning rates activate immediately.</li>
                <li>Per credit card rules, product changes do not earn a new sign-up bonus.</li>
              </ul>
            </div>

            {/* Customization Form */}
            <div className="glass-card mb-md" style={{ padding: '14px' }}>
              <div className="font-bold text-xs text-muted mb-sm uppercase" style={{ letterSpacing: '0.5px' }}>
                Card Customization
              </div>

              <div className="form-group mb-sm">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nickname</label>
                <input
                  className="form-input"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder={selectedTemplate.name}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-sm">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Last 4 Digits</label>
                  <input
                    className="form-input"
                    value={lastFour}
                    onChange={e => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    maxLength={4}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Annual Fee Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={annualFeeDate}
                    onChange={e => setAnnualFeeDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-sm mt-md">
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedTemplate(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleConfirmProductChange}
                disabled={submitting}
              >
                {submitting
                  ? 'Processing...'
                  : feeDifference > 0
                  ? `Confirm Upgrade`
                  : feeDifference < 0
                  ? `Confirm Downgrade`
                  : `Confirm Product Change`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
