import { useState } from 'react';
import type { UserPerk, CardTemplate, PerkTemplate } from '../db/types';
import { togglePerk, togglePerkActivation } from '../db/helpers';
import { useToast } from './ToastContext';
import { InfoIcon } from './InfoIcon';
import { PerkDetailsModal } from './PerkDetailsModal';

interface PerksSectionProps {
  perks?: UserPerk[];
  template: CardTemplate;
  readOnly?: boolean;
}

export function PerksSection({ perks, template, readOnly = false }: PerksSectionProps) {
  const [selectedPerkTemplate, setSelectedPerkTemplate] = useState<PerkTemplate | null>(null);
  const { showToast } = useToast();

  const handleToggle = async (perk: UserPerk) => {
    if (readOnly || !perk.id) return;
    await togglePerk(perk.id);
    if (perk.used) {
      showToast(`${perk.perkName} restored`);
    } else {
      showToast(`${perk.perkName} recorded!`);
    }
  };

  const perkTemplateMap = new Map<string, PerkTemplate>();
  template.perks.forEach(p => perkTemplateMap.set(p.id, p));

  const handleInfoClick = (e: React.MouseEvent, pt: PerkTemplate | undefined) => {
    e.stopPropagation();
    if (pt) {
      setSelectedPerkTemplate(pt);
    }
  };

  // If perks (from DB) is missing, create mock perks for preview
  const displayPerks: UserPerk[] = perks || template.perks.map(pt => ({
    perkTemplateId: pt.id,
    perkName: pt.name,
    category: pt.category,
    used: false,
    active: true,
    currentPeriodStart: '',
    currentPeriodEnd: '',
    renewalPeriod: pt.renewalPeriod,
    annualValue: pt.annualValue,
    periodValue: pt.periodValue,
    cardId: 0
  }));

  const valuablePerks = displayPerks.filter((p: UserPerk) => p.annualValue > 0);
  const otherPerks = displayPerks.filter((p: UserPerk) => p.annualValue === 0);

  const renderPerkItem = (perk: UserPerk) => {
    const pt = perkTemplateMap.get(perk.perkTemplateId);
    const hasExtraInfo = !!(pt && (pt.details || pt.usageLink));

    return (
      <div key={perk.perkTemplateId} className={`perk-item ${perk.used ? 'used' : ''}`}>
        {perk.active === false ? (
          <div className="perk-main-action" style={{ cursor: 'default' }}>
            <div className="perk-info" style={{ flex: 1, paddingLeft: '8px' }}>
              <div className="perk-name flex items-center gap-sm">
                {perk.perkName}
              </div>
              <div className="perk-desc">{pt?.description || ''}</div>
            </div>
            <div className="perk-amount">
              {perk.periodValue ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <div className="perk-value">${perk.periodValue}</div>
                  <div className="perk-period">/{perk.renewalPeriod === 'monthly' ? 'mo' : perk.renewalPeriod === 'quarterly' ? 'qtr' : perk.renewalPeriod === 'semi-annual' ? '6mo' : 'yr'}</div>
                </div>
              ) : (
                <div className="perk-value">${perk.annualValue}</div>
              )}
            </div>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '12px', marginTop: '4px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (perk.id) togglePerkActivation(perk.id, true);
                  }}
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="perk-main-action" onClick={() => handleToggle(perk)} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
            {!readOnly && (
              <div className={`perk-checkbox ${perk.used ? 'checked' : ''}`}>
                {perk.used && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            )}
            <div className="perk-info" style={{ flex: 1, paddingLeft: readOnly ? '8px' : '0' }}>
              <div className="perk-name flex items-center gap-sm">
                {perk.perkName}
              </div>
              <div className="perk-desc">{pt?.description || ''}</div>
              {pt?.requiresEnrollment && !readOnly && (
                <div className="text-xs mt-sm">
                  <button 
                    className="link-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (perk.id) togglePerkActivation(perk.id, false); 
                    }}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0 }}
                  >
                    Deactivate
                  </button>
                </div>
              )}
            </div>
            <div className="perk-amount">
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
        )}
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
  };

  return (
    <>
      {valuablePerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <h3 className="section-title">Credits & Perks</h3>
            {!readOnly && (
              <span className="badge badge-gold">
                ${valuablePerks.filter((p: UserPerk) => !p.used).reduce((s: number, p: UserPerk) => s + (p.periodValue ?? p.annualValue), 0)} unclaimed
              </span>
            )}
          </div>
          {valuablePerks.map(renderPerkItem)}
        </>
      )}

      {otherPerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <h3 className="section-title">Other Benefits</h3>
          </div>
          {otherPerks.map(renderPerkItem)}
        </>
      )}

      {selectedPerkTemplate && (
        <PerkDetailsModal
          template={selectedPerkTemplate}
          onClose={() => setSelectedPerkTemplate(null)}
        />
      )}
    </>
  );
}
