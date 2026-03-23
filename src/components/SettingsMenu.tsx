import { useState, useEffect, useRef } from 'react';
import { FeatureRequestModal } from './FeatureRequestModal';
import { RequestCardModal } from './RequestCardModal';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [isCompact, setIsCompact] = useState(() => localStorage.getItem('compact_mode') === 'true');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('compact_mode', isCompact.toString());
    window.dispatchEvent(new Event('compactModeChanged'));
  }, [isCompact]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button 
        className="btn btn-icon" 
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item" style={{ cursor: 'default', justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Compact Mode
            </div>
            <input 
              type="checkbox" 
              checked={isCompact} 
              onChange={(e) => setIsCompact(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ height: '1px', background: 'var(--bg-glass-border)', margin: '4px 0' }} />
          <button 
            className="dropdown-item" 
            onClick={() => {
              setShowCardModal(true);
              setIsOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Request New Card
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => {
              setShowFeatureModal(true);
              setIsOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Request Feature
          </button>
        </div>
      )}

      {showCardModal && (
        <RequestCardModal onClose={() => setShowCardModal(false)} />
      )}

      {showFeatureModal && (
        <FeatureRequestModal onClose={() => setShowFeatureModal(false)} />
      )}
    </div>
  );
}
