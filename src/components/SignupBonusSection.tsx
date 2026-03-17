import { useState } from 'react';
import type { SignupBonus, CardTemplate } from '../db/types';
import { updateBonusSpend, updateSignupBonus } from '../db/helpers';
import { useToast } from './ToastContext';

interface SignupBonusSectionProps {
  bonus?: SignupBonus;
  template?: CardTemplate;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function SignupBonusSection({ bonus, template }: SignupBonusSectionProps) {
  const [editingSpend, setEditingSpend] = useState(false);
  const [spendValue, setSpendValue] = useState('');
  const [updating, setUpdating] = useState(false);

  const [showEditBonus, setShowEditBonus] = useState(false);
  const [editBonusPoints, setEditBonusPoints] = useState('');
  const [editTargetSpend, setEditTargetSpend] = useState('');
  const [editBonusUnit, setEditBonusUnit] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const { showToast } = useToast();

  const handleSpendUpdate = async () => {
    if (bonus?.id) {
      await updateBonusSpend(bonus.id, parseFloat(spendValue) || 0);
      setEditingSpend(false);
      showToast('Spend updated!');
    }
  };

  const handleEditBonus = async () => {
    if (!bonus?.id) return;
    setUpdating(true);
    try {
      await updateSignupBonus(bonus.id, {
        targetSpend: parseFloat(editTargetSpend) || 0,
        bonusPoints: parseInt(editBonusPoints) || 0,
        bonusUnit: editBonusUnit,
        deadline: editDeadline,
      });
      setShowEditBonus(false);
      showToast('Sign-up bonus updated!');
    } finally {
      setUpdating(false);
    }
  };

  if (bonus?.completed) {
    return (
      <div className="glass-card mt-md" style={{ borderColor: 'var(--accent-green)' }}>
        <div className="flex items-center gap-sm">
          <span style={{ fontSize: '1.5rem' }}>🎉</span>
          <div>
            <div className="font-bold text-green">Bonus Earned!</div>
            <div className="text-sm text-muted">{bonus.bonusPoints.toLocaleString()} {bonus.bonusUnit}</div>
          </div>
        </div>
      </div>
    );
  }

  const signupBonusData = bonus ? {
    points: bonus.bonusPoints,
    spend: bonus.targetSpend,
    unit: bonus.bonusUnit,
    deadline: bonus.deadline,
    currentSpend: bonus.currentSpend,
    isExisting: true
  } : template ? {
    points: template.signupBonus.points,
    spend: template.signupBonus.spend,
    unit: template.signupBonus.unit,
    deadline: '', // No deadline for template preview
    currentSpend: 0,
    isExisting: false
  } : null;

  if (!signupBonusData) return null;

  return (
    <>
      <div className="glass-card mt-md">
        <div className="section-header">
          <h3 className="section-title">Sign-up Bonus</h3>
          {signupBonusData.isExisting && (
            <div className="flex items-center gap-sm">
              <span className={`countdown ${daysUntil(signupBonusData.deadline) <= 30 ? 'urgent' : ''}`}>
                {daysUntil(signupBonusData.deadline) > 0 ? `${daysUntil(signupBonusData.deadline)}d left` : 'Expired'}
              </span>
              <button 
                className="edit-icon-btn"
                style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, opacity: 0.7, cursor: 'pointer' }}
                onClick={() => {
                  if (bonus) {
                    setEditBonusPoints(String(bonus.bonusPoints));
                    setEditTargetSpend(String(bonus.targetSpend));
                    setEditBonusUnit(bonus.bonusUnit);
                    setEditDeadline(bonus.deadline);
                    setShowEditBonus(true);
                  }
                }}
                aria-label="Edit sign-up bonus"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-muted mb-md">
          Spend ${signupBonusData.spend.toLocaleString()} to earn {signupBonusData.points.toLocaleString()} {signupBonusData.unit}
          {!signupBonusData.isExisting && template && (
            <span> in {template.signupBonus.timeMonths} months</span>
          )}
        </div>
        {signupBonusData.isExisting && (
          <>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${signupBonusData.currentSpend >= signupBonusData.spend ? 'complete' : ''}`}
                style={{ width: `${Math.min(100, (signupBonusData.currentSpend / signupBonusData.spend) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-sm">
              <span className="text-sm">${signupBonusData.currentSpend.toLocaleString()} / ${signupBonusData.spend.toLocaleString()}</span>
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
                    onKeyDown={e => e.key === 'Enter' && handleSpendUpdate()}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSpendUpdate}>Save</button>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => { setSpendValue(String(signupBonusData.currentSpend)); setEditingSpend(true); }}>
                  Update Spend
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showEditBonus && bonus && (
        <div className="modal-overlay" onClick={() => setShowEditBonus(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Edit Sign-up Bonus</h3>
            
            <div className="form-group">
              <label className="form-label">Bonus Amount</label>
              <input type="number" className="form-input" value={editBonusPoints} onChange={e => setEditBonusPoints(e.target.value)} placeholder="e.g. 50000" />
            </div>

            <div className="form-group">
              <label className="form-label">Bonus Unit</label>
              <input className="form-input" value={editBonusUnit} onChange={e => setEditBonusUnit(e.target.value)} placeholder="e.g. points, miles, cash back" />
            </div>

            <div className="form-group">
              <label className="form-label">Target Spend ($)</label>
              <input type="number" className="form-input" value={editTargetSpend} onChange={e => setEditTargetSpend(e.target.value)} placeholder="e.g. 3000" />
            </div>

            <div className="form-group">
              <label className="form-label">Spend Deadline</label>
              <input type="date" className="form-input" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
            </div>

            <div className="flex gap-sm mt-lg">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditBonus(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleEditBonus} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
