import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../notifications';
import type { SignupBonus, UserPerk } from '../db/types';
import { BestCardSection } from '../components/BestCardSection';

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

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [notifDismissed, setNotifDismissed] = useState(
    () => localStorage.getItem('notif_prompt_dismissed') === 'true'
  );

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  // Listen for permission changes
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then(status => {
        status.onchange = () => setNotifPermission(status.state as NotificationPermission);
      }).catch(() => { /* older browsers */ });
    }
  }, []);

  const activeCards = cards?.length ?? 0;
  const activeBonuses = bonuses?.filter((b: SignupBonus) => !b.completed) ?? [];
  const unusedPerks = perks?.filter((p: UserPerk) => !p.used && p.active !== false && p.annualValue > 0 && p.renewalPeriod !== 'ongoing' && p.renewalPeriod !== 'one-time') ?? [];
  const totalPerkValue = unusedPerks.reduce((sum: number, p: UserPerk) => sum + (p.periodValue ?? p.annualValue), 0);

  const showNotifPrompt = notifPermission === 'default' && !notifDismissed && activeCards > 0;

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  };

  const handleDismissNotifPrompt = () => {
    setNotifDismissed(true);
    localStorage.setItem('notif_prompt_dismissed', 'true');
  };

  const handleFeatureSubmit = () => {
    const baseUrl = 'https://github.com/henrysha/credit-card-rewards-pwa/issues/new';
    const params = new URLSearchParams({
      title: `[Feature Request] ${featureTitle}`,
      body: featureDesc,
      labels: 'feature-request'
    });
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    setShowFeatureModal(false);
    setFeatureTitle('');
    setFeatureDesc('');
  };

  return (
    <div className="page animate-in">
      <div className="page-header flex justify-between items-center">
        <h1>Dashboard</h1>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setShowFeatureModal(true)}
          style={{ padding: '6px 12px' }}
        >
          Request Feature
        </button>
      </div>

      {showNotifPrompt && (
        <div className="notification-prompt">
          <div className="notification-prompt-icon">🔔</div>
          <div className="notification-prompt-content">
            <div className="notification-prompt-title">Enable Perk Reminders</div>
            <div className="notification-prompt-desc">Get notified when your perks are about to expire so you never miss a credit.</div>
          </div>
          <div className="notification-prompt-actions">
            <button className="btn btn-primary btn-sm" onClick={handleEnableNotifications}>Enable</button>
            <button className="btn btn-sm" onClick={handleDismissNotifPrompt} style={{ opacity: 0.6 }}>Later</button>
          </div>
        </div>
      )}

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
          <div className="section-header mt-lg">
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
                  <span>{Math.floor(pct)}%</span>
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
            <div key={perk.id} className="perk-item">
              <div className="perk-main-action" onClick={() => navigate(`/card/${perk.cardId}`)}>
                <div className="perk-info">
                  <div className="perk-name">{perk.perkName}</div>
                  <div className="perk-desc">{perk.renewalPeriod}</div>
                </div>
                {perk.periodValue ? (
                  <div className="perk-amount">
                    <div className="perk-value">${perk.periodValue}</div>
                    <div className="perk-period">/{perk.renewalPeriod === 'monthly' ? 'mo' : perk.renewalPeriod === 'quarterly' ? 'qtr' : 'period'}</div>
                  </div>
                ) : perk.annualValue > 0 ? (
                  <div className="perk-amount">
                    <div className="perk-value">${perk.annualValue}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {unusedPerks.length > 5 && (
            <div className="text-sm text-muted mt-sm" style={{ textAlign: 'center' }}>
              +{unusedPerks.length - 5} more unused perks
            </div>
          )}
        </>
      )}

      <BestCardSection />

      {activeCards === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <div className="empty-state-text">No cards added yet. Browse the catalog to get started!</div>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse Card Catalog</button>
        </div>
      )}

      {showFeatureModal && (
        <div className="modal-overlay" onClick={() => setShowFeatureModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Submit Feature Request</h3>
            <p className="text-sm text-muted mb-md">
              Tell us what features you'd like to see! This will redirect you to GitHub to create an issue.
            </p>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                className="form-input" 
                value={featureTitle} 
                onChange={e => setFeatureTitle(e.target.value)} 
                placeholder="e.g. Add support for Marriott cards" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={featureDesc} 
                onChange={e => setFeatureDesc(e.target.value)} 
                placeholder="Describe the feature in more detail..." 
              />
            </div>

            <div className="flex gap-sm mt-lg">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFeatureModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }} 
                onClick={handleFeatureSubmit}
                disabled={!featureTitle.trim()}
              >
                Continue to GitHub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

