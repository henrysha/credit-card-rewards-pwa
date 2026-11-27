import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardTemplates } from '../db/seed-data';

const SCROLL_KEY = 'catalog_master_scroll_top';

interface CatalogMasterSidebarProps {
  selectedTemplateId: string;
  onSelectTemplate?: (cardName: string) => void;
}

export function CatalogMasterSidebar({ selectedTemplateId, onSelectTemplate }: CatalogMasterSidebarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const paneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paneRef.current) {
      const saved = Number(sessionStorage.getItem(SCROLL_KEY) || '0');
      if (saved > 0) paneRef.current.scrollTop = saved;
    }
  }, []);

  const filtered = query
    ? cardTemplates.filter(
        c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.issuer.toLowerCase().includes(query.toLowerCase())
      )
    : cardTemplates;

  const handleSelect = (id: string, name: string) => {
    if (paneRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(paneRef.current.scrollTop));
    }
    navigate(`/catalog/${id}`);
    onSelectTemplate?.(name);
  };

  return (
    <aside
      ref={paneRef}
      className="duo-master-pane"
      aria-label="Catalog cards list"
      data-testid="catalog-master-pane"
      onScroll={(e) => {
        sessionStorage.setItem(SCROLL_KEY, String(e.currentTarget.scrollTop));
      }}
    >
      <div className="section-header">
        <span className="section-title">Catalog ({filtered.length})</span>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/catalog')}>
          All Filters
        </button>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          placeholder="Quick filter catalog..."
          aria-label="Quick filter catalog"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="duo-master-list">
        {filtered.map(card => {
          const isSelected = card.id === selectedTemplateId;
          return (
            <button
              key={card.id}
              type="button"
              className={`duo-master-card ${isSelected ? 'active' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => handleSelect(card.id, card.name)}
            >
              <div className="duo-master-swatch" style={{ background: card.color }} />
              <div className="duo-master-info">
                <div className="duo-master-title">{card.name}</div>
                <div className="duo-master-meta">
                  {card.issuer} • ${card.annualFee}/yr
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

interface CatalogPreviewCompanionProps {
  filteredCount: number;
  issuerFilter: string;
  onRequestCard: () => void;
}

export function CatalogPreviewCompanion({
  filteredCount,
  issuerFilter,
  onRequestCard,
}: CatalogPreviewCompanionProps) {
  return (
    <aside className="duo-companion-pane" aria-label="Catalog inspector pane" data-testid="catalog-companion-pane">
      <div className="duo-pane-surface">
        <div className="section-header">
          <span className="section-title">Catalog Inspector</span>
          <span className="badge badge-gold">{filteredCount} matching</span>
        </div>
        <p className="text-sm text-secondary mb-md">
          Select any card from the catalog on the left to open its full side-by-side breakdown of welcome offers, earning multipliers, and recurring credits.
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{filteredCount}</div>
            <div className="stat-label">Visible Cards</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{issuerFilter === 'all' ? 'All' : issuerFilter}</div>
            <div className="stat-label">Issuer Filter</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-block mt-sm" onClick={onRequestCard}>
          Suggest Missing Card
        </button>
      </div>
    </aside>
  );
}
