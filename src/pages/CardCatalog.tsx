import { cardTemplates } from '../db/seed-data';
import { addCard } from '../db/helpers';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { CardTemplate } from '../db/types';

export default function CardCatalog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState<CardTemplate | null>(null);
  const [openDate, setOpenDate] = useState(new Date().toISOString().split('T')[0]);
  const [nickname, setNickname] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [adding, setAdding] = useState(false);

  const issuers = ['all', 'Chase', 'Amex', 'Capital One', 'Citi'];

  let filtered = cardTemplates;
  if (issuerFilter !== 'all') {
    filtered = filtered.filter(c => c.issuer === issuerFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
  }

  const handleAdd = async () => {
    if (!selectedCard || adding) return;
    setAdding(true);
    try {
      const cardId = await addCard(selectedCard.id, openDate, nickname || undefined, lastFour || undefined);
      setSelectedCard(null);
      setNickname('');
      setLastFour('');
      navigate(`/card/${cardId}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Card Catalog</h1>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input placeholder="Search cards..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="tabs">
        {issuers.map(issuer => (
          <button key={issuer} className={`tab ${issuerFilter === issuer ? 'active' : ''}`} onClick={() => setIssuerFilter(issuer)}>
            {issuer === 'all' ? 'All' : issuer}
          </button>
        ))}
      </div>

      {filtered.map(card => (
        <div key={card.id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedCard(card); setOpenDate(new Date().toISOString().split('T')[0]); }}>
          <div className="flex items-center gap-md">
            <div style={{ width: 48, height: 32, borderRadius: 6, background: card.color, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-bold" style={{ fontSize: '0.9rem' }}>{card.name}</div>
              <div className="text-xs text-muted">{card.issuer} • ${card.annualFee}/yr{card.isBusinessCard ? ' • Business' : ''}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="text-gold font-bold" style={{ fontSize: '0.85rem' }}>
                {card.signupBonus.points >= 1000
                  ? `${(card.signupBonus.points / 1000).toFixed(0)}K`
                  : card.signupBonus.points}
              </div>
              <div className="text-xs text-muted">{card.signupBonus.unit}</div>
            </div>
          </div>
          <div className="mt-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {card.perks.filter(p => p.annualValue > 0).slice(0, 4).map(p => (
              <span key={p.id} className="badge badge-gold" style={{ fontSize: '0.6rem' }}>{p.name}</span>
            ))}
            {card.perks.filter(p => p.annualValue > 0).length > 4 && (
              <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>+{card.perks.filter(p => p.annualValue > 0).length - 4} more</span>
            )}
          </div>
        </div>
      ))}

      {/* Add Card Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="card-tile" style={{ background: selectedCard.color, marginBottom: 16 }}>
              <div className="card-issuer">{selectedCard.issuer}</div>
              <div className="card-name">{selectedCard.name}</div>
              <div className="card-fee">${selectedCard.annualFee}/yr</div>
            </div>

            <h3 className="mb-md">Add to My Wallet</h3>

            <div className="form-group">
              <label className="form-label">Date Opened *</label>
              <input type="date" className="form-input" value={openDate} onChange={e => setOpenDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Nickname (optional)</label>
              <input className="form-input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g. My travel card" />
            </div>

            <div className="form-group">
              <label className="form-label">Last 4 Digits (optional)</label>
              <input className="form-input" value={lastFour} onChange={e => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} />
            </div>

            {/* Quick preview of bonuses and top perks */}
            <div className="glass-card mb-md">
              <div className="text-sm font-bold mb-sm">Sign-up Bonus</div>
              <div className="text-sm">
                {selectedCard.signupBonus.points.toLocaleString()} {selectedCard.signupBonus.unit} after ${selectedCard.signupBonus.spend.toLocaleString()} in {selectedCard.signupBonus.timeMonths} months
              </div>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedCard(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={adding}>
                {adding ? 'Adding...' : 'Add Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
