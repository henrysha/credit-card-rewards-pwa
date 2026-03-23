import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { UserCard } from '../db/types';
import { getTextColorForBackground } from '../utils/color';
import { SettingsMenu } from '../components/SettingsMenu';
import { useToast } from '../components/ToastContext';

export default function MyCards() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cards = useLiveQuery(() => db.cards.toArray());
  const [isCompact, setIsCompact] = useState(() => localStorage.getItem('compact_mode') === 'true');

  useEffect(() => {
    const handleCompactChange = () => {
      setIsCompact(localStorage.getItem('compact_mode') === 'true');
    };
    window.addEventListener('compactModeChanged', handleCompactChange);
    return () => window.removeEventListener('compactModeChanged', handleCompactChange);
  }, []);

  const activeCards = cards?.filter((c: UserCard) => c.status === 'active') ?? [];
  const closedCards = cards?.filter((c: UserCard) => c.status !== 'active') ?? [];

  const copyToClipboard = () => {
    if (activeCards.length === 0) {
      showToast('No active cards to copy');
      return;
    }

    const text = activeCards.map((card: UserCard) => {
      const template = getCardTemplate(card.cardTemplateId);
      if (!template) return '';
      let info = `${template.issuer}: ${card.nickname || template.name}`;
      if (card.lastFourDigits) info += ` (•••• ${card.lastFourDigits})`;
      
      const rates = template.earningRates
        .map(r => `  - ${r.multiplier}x on ${r.category}${r.limit ? ` (up to ${r.limit})` : ''}`)
        .join('\n');
      
      return `${info}\n${rates}`;
    }).filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      showToast('Card list copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard');
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>My Cards</h1>
        <div className="flex gap-sm items-center">
          <button className="btn btn-secondary btn-icon" onClick={copyToClipboard} title="Copy card list to clipboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/catalog')}>+ Add Card</button>
          <SettingsMenu />
        </div>
      </div>

      {activeCards.length === 0 && closedCards.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <div className="empty-state-text">You haven't added any cards yet.</div>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse Card Catalog</button>
        </div>
      )}

      {activeCards.map((card: UserCard) => {
        const template = getCardTemplate(card.cardTemplateId);
        if (!template) return null;
        return (
          <div
            key={card.id}
            className={`card-tile ${isCompact ? 'compact' : ''}`}
            style={{ background: template.color, color: getTextColorForBackground(template.color), marginBottom: isCompact ? 8 : 16 }}
            onClick={() => navigate(`/card/${card.id}`)}
          >
            <div className="card-issuer">{template.issuer}</div>
            <div className="card-name">{card.nickname || template.name}</div>
            <div className="card-fee">${template.annualFee}/yr</div>
            {card.lastFourDigits && <div className="card-last-four">•••• {card.lastFourDigits}</div>}
          </div>
        );
      })}

      {closedCards.length > 0 && (
        <>
          <div className="section-header mt-lg">
            <span className="section-title">Closed / Product Changed</span>
          </div>
          {closedCards.map((card: UserCard) => {
            const template = getCardTemplate(card.cardTemplateId);
            if (!template) return null;
            return (
              <div
                key={card.id}
                className={`card-tile ${isCompact ? 'compact' : ''}`}
                style={{ background: template.color, color: getTextColorForBackground(template.color), opacity: 0.5, marginBottom: isCompact ? 8 : 12 }}
                onClick={() => navigate(`/card/${card.id}`)}
              >
                <div className="card-issuer">{template.issuer}</div>
                <div className="card-name">{card.nickname || template.name}</div>
                <span className="badge badge-red" style={{ position: isCompact ? 'static' : 'absolute', top: 12, right: 12 }}>{card.status}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
