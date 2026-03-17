import { useState, useEffect, useRef } from 'react';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
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

  const handleFeatureSubmit = () => {
    const baseUrl = 'https://github.com/henrysha/credit-card-rewards-pwa/issues/new';
    const params = new URLSearchParams({
      title: `[Feature Request] ${featureTitle}`,
      body: featureDesc,
      labels: 'feature-request'
    });
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    setShowFeatureModal(false);
    setFeatureTitle('');
    setFeatureDesc('');
    setIsOpen(false);
  };

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

      {showFeatureModal && (
        <div className="modal-overlay" onClick={() => setShowFeatureModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Submit Feature Request</h3>
            <p className="text-sm text-muted mb-md">
              Tell us what features you'd like to see! This will redirect you to GitHub to create an issue.
            </p>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                className="form-input" 
                value={featureTitle} 
                onChange={e => setFeatureTitle(e.target.value)} 
                placeholder="e.g. Add support for Marriott cards" 
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={featureDesc} 
                onChange={e => setFeatureDesc(e.target.value)} 
                placeholder="Describe the feature in more detail..." 
              />
            </div>

            <div className="flex gap-sm mt-lg">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFeatureModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }} 
                onClick={handleFeatureSubmit}
                disabled={!featureTitle.trim()}
              >
                Continue to GitHub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
