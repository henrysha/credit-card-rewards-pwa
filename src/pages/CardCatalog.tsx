import { cardTemplates } from '../db/seed-data';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CardCatalog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('all');

  const issuers = ['all', 'Chase', 'Amex', 'Capital One', 'Citi'];

  let filtered = cardTemplates;
  if (issuerFilter !== 'all') {
    filtered = filtered.filter(c => c.issuer === issuerFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
  }


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
        <div key={card.id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalog/${card.id}`)}>
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
    </div>
  );
}
