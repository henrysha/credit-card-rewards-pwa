import { useState } from 'react';

interface FeatureRequestModalProps {
  onClose: () => void;
}

export function FeatureRequestModal({ onClose }: FeatureRequestModalProps) {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  const handleFeatureSubmit = () => {
    const baseUrl = 'https://github.com/henrysha/credit-card-rewards-pwa/issues/new';
    const params = new URLSearchParams({
      title: `[Feature Request] ${featureTitle}`,
      body: featureDesc,
      labels: 'feature-request'
    });
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
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
  );
}
