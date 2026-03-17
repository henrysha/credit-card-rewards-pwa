import { useState, useEffect, useRef } from 'react';
import { FeatureRequestModal } from './FeatureRequestModal';
import { RequestCardModal } from './RequestCardModal';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        className="btn btn-icon btn-secondary" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
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
