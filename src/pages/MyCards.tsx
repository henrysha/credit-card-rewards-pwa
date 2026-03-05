import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate } from '../db/helpers';
import { useNavigate } from 'react-router-dom';
import type { UserCard } from '../db/types';

export default function MyCards() {
  const navigate = useNavigate();
  const cards = useLiveQuery(() => db.cards.toArray());

  const activeCards = cards?.filter((c: UserCard) => c.status === 'active') ?? [];
  const closedCards = cards?.filter((c: UserCard) => c.status !== 'active') ?? [];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>My Cards</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/catalog')}>+ Add Card</button>
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
            className="card-tile"
            style={{ background: template.color, marginBottom: 16 }}
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
                className="card-tile"
                style={{ background: template.color, opacity: 0.5, marginBottom: 12 }}
                onClick={() => navigate(`/card/${card.id}`)}
              >
                <div className="card-issuer">{template.issuer}</div>
                <div className="card-name">{card.nickname || template.name}</div>
                <span className="badge badge-red" style={{ position: 'absolute', top: 12, right: 12 }}>{card.status}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
