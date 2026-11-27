import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import type { UserCard } from '../db/types';

const SCROLL_KEY = 'wallet_master_scroll_top';

interface WalletMasterSidebarProps {
  selectedCardId: number;
  onSelectCard?: (cardName: string, cardId?: number) => void;
}

export function WalletMasterSidebar({ selectedCardId, onSelectCard }: WalletMasterSidebarProps) {
  const navigate = useNavigate();
  const cards = useLiveQuery(() => db.cards.toArray());
  const paneRef = useRef<HTMLElement>(null);

  const activeCards = (cards ?? []).filter((c: UserCard) => c.status === 'active');
  const closedCards = (cards ?? []).filter((c: UserCard) => c.status !== 'active');

  useEffect(() => {
    if (paneRef.current) {
      const saved = Number(sessionStorage.getItem(SCROLL_KEY) || '0');
      if (saved > 0) paneRef.current.scrollTop = saved;
    }
  }, []);

  const handleCardSelect = (card: UserCard, displayName: string) => {
    if (paneRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(paneRef.current.scrollTop));
    }
    navigate(`/card/${card.id}`);
    onSelectCard?.(displayName, card.id);
  };

  return (
    <aside
      ref={paneRef}
      className="duo-master-pane"
      aria-label="Wallet cards list"
      data-testid="wallet-master-pane"
      onScroll={(e) => {
        sessionStorage.setItem(SCROLL_KEY, String(e.currentTarget.scrollTop));
      }}
    >
      <div className="section-header">
        <span className="section-title">My Wallet ({activeCards.length})</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/catalog')}>
          + Add Card
        </button>
      </div>

      <div className="duo-master-list">
        {activeCards.map((card: UserCard) => {
          const template = getCardTemplate(card.cardTemplateId);
          if (!template) return null;
          const isSelected = card.id === selectedCardId;
          const displayName = card.nickname || template.name;

          return (
            <button
              key={card.id}
              type="button"
              className={`duo-master-card ${isSelected ? 'active' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => handleCardSelect(card, displayName)}
            >
              <div className="duo-master-swatch" style={{ background: template.color }} />
              <div className="duo-master-info">
                <div className="duo-master-title">{displayName}</div>
                <div className="duo-master-meta">
                  {template.issuer} • ${template.annualFee}/yr
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {closedCards.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">History ({closedCards.length})</span>
          </div>
          <div className="duo-master-list">
            {closedCards.map((card: UserCard) => {
              const template = getCardTemplate(card.cardTemplateId);
              if (!template) return null;
              const isSelected = card.id === selectedCardId;
              const displayName = card.nickname || template.name;

              return (
                <button
                  key={card.id}
                  type="button"
                  className={`duo-master-card ${isSelected ? 'active' : ''}`}
                  style={{ opacity: isSelected ? 0.9 : 0.6 }}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => handleCardSelect(card, displayName)}
                >
                  <div className="duo-master-swatch" style={{ background: template.color }} />
                  <div className="duo-master-info">
                    <div className="duo-master-title">{displayName}</div>
                    <div className="duo-master-meta">{card.status}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}

interface WalletOverviewCompanionProps {
  activeCards: UserCard[];
  closedCards: UserCard[];
}

export function WalletOverviewCompanion({ activeCards, closedCards }: WalletOverviewCompanionProps) {
  const navigate = useNavigate();

  const totalAnnualFees = activeCards.reduce((sum, card) => {
    const t = getCardTemplate(card.cardTemplateId);
    return sum + (t?.annualFee ?? 0);
  }, 0);

  return (
    <aside className="duo-companion-pane" aria-label="Wallet summary pane" data-testid="wallet-companion-pane">
      <div className="duo-pane-surface">
        <div className="section-header">
          <span className="section-title">Wallet Inspector</span>
          <span className="badge badge-gold">${totalAnnualFees}/yr total fees</span>
        </div>
        <p className="text-sm text-secondary mb-md">
          Select any card on the left to inspect its sign-up bonus tracker, earning multipliers, rotating categories, and statement credits side-by-side.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{activeCards.length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{closedCards.length}</div>
            <div className="stat-label">History</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-block mt-sm" onClick={() => navigate('/catalog')}>
          Explore Card Catalog
        </button>
      </div>
    </aside>
  );
}
