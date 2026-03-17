import { useState } from 'react';

interface RequestCardModalProps {
  onClose: () => void;
}

export function RequestCardModal({ onClose }: RequestCardModalProps) {
  const [cardName, setCardName] = useState('');
  const [issuer, setIssuer] = useState('');

  const handleSubmit = () => {
    const baseUrl = 'https://github.com/henrysha/credit-card-rewards-pwa/issues/new';
    const params = new URLSearchParams({
      title: `[Card Request] ${cardName}`,
      body: `**Card Name:** ${cardName}\n**Issuer:** ${issuer}\n\nRelated to #4`,
      labels: 'card-request'
    });
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="mb-md">Request New Card</h3>
        <p className="text-sm text-muted mb-md">
          Is there a card missing from our catalog? Let us know! Please check if the card has already been requested before creating a new issue.
          <br />
          <a 
            href="https://github.com/henrysha/credit-card-rewards-pwa/issues/4" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold"
            style={{ textDecoration: 'underline', fontSize: '0.75rem', marginTop: '4px', display: 'inline-block' }}
          >
            View existing requests on Issue #4
          </a>
        </p>
        
        <div className="form-group">
          <label className="form-label">Card Name</label>
          <input 
            className="form-input" 
            value={cardName} 
            onChange={e => setCardName(e.target.value)} 
            placeholder="e.g. Marriott Bonvoy Boundless" 
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Issuer</label>
          <input 
            className="form-input" 
            value={issuer} 
            onChange={e => setIssuer(e.target.value)} 
            placeholder="e.g. Chase" 
          />
        </div>

        <div className="flex gap-sm mt-lg">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1 }} 
            onClick={handleSubmit}
            disabled={!cardName.trim() || !issuer.trim()}
          >
            Continue to GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
