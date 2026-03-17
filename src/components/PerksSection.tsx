import { useState } from 'react';
import type { UserPerk, CardTemplate, PerkTemplate } from '../db/types';
import { togglePerk, togglePerkActivation } from '../db/helpers';
import { useToast } from './ToastContext';
import { InfoIcon } from './InfoIcon';
import { PerkDetailsModal } from './PerkDetailsModal';

interface PerksSectionProps {
  perks: UserPerk[];
  template: CardTemplate;
}

export function PerksSection({ perks, template }: PerksSectionProps) {
  const [selectedPerkTemplate, setSelectedPerkTemplate] = useState<PerkTemplate | null>(null);
  const { showToast } = useToast();

  const handleToggle = async (perk: UserPerk) => {
    await togglePerk(perk.id!);
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

  const valuablePerks = perks.filter((p: UserPerk) => p.annualValue > 0);
  const otherPerks = perks.filter((p: UserPerk) => p.annualValue === 0);

  const renderPerkItem = (perk: UserPerk) => {
    const pt = perkTemplateMap.get(perk.perkTemplateId);
    const hasExtraInfo = !!(pt && (pt.details || pt.usageLink));

    return (
      <div key={perk.id} className={`perk-item ${perk.used ? 'used' : ''}`}>
        {perk.active === false ? (
          <div className="perk-main-action" style={{ cursor: 'default' }}>
            <div className="perk-info" style={{ flex: 1, paddingLeft: '8px' }}>
              <div className="perk-name flex items-center gap-sm">
                {perk.perkName}
              </div>
              <div className="perk-desc">{pt?.description || ''}</div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              {perk.periodValue ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <div className="perk-value">${perk.periodValue}</div>
                  <div className="perk-period">/{perk.renewalPeriod === 'monthly' ? 'mo' : perk.renewalPeriod === 'quarterly' ? 'qtr' : perk.renewalPeriod === 'semi-annual' ? '6mo' : 'yr'}</div>
                </div>
              ) : (
                <div className="perk-value">${perk.annualValue}</div>
              )}
              <button 
                className="btn btn-primary" 
                style={{ padding: '4px 8px', fontSize: '12px', marginTop: '4px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePerkActivation(perk.id!, true);
                }}
              >
                Activate
              </button>
            </div>
          </div>
        ) : (
          <div className="perk-main-action" onClick={() => handleToggle(perk)}>
            <div className={`perk-checkbox ${perk.used ? 'checked' : ''}`}>
              {perk.used && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div className="perk-info" style={{ flex: 1 }}>
              <div className="perk-name flex items-center gap-sm">
                {perk.perkName}
              </div>
              <div className="perk-desc">{pt?.description || ''}</div>
              {pt?.requiresEnrollment && (
                <div className="text-xs mt-sm">
                  <button 
                    className="link-btn" 
                    onClick={(e) => { e.stopPropagation(); togglePerkActivation(perk.id!, false); }}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0 }}
                  >
                    Deactivate
                  </button>
                </div>
              )}
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
            <span className="section-title">Credits & Perks</span>
            <span className="badge badge-gold">
              ${valuablePerks.filter((p: UserPerk) => !p.used).reduce((s: number, p: UserPerk) => s + (p.periodValue ?? p.annualValue), 0)} unclaimed
            </span>
          </div>
          {valuablePerks.map(renderPerkItem)}
        </>
      )}

      {otherPerks.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">Other Benefits</span>
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
