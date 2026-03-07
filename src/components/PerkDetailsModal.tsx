import type { PerkTemplate } from '../db/types';

interface PerkDetailsModalProps {
  template: PerkTemplate;
  onClose: () => void;
}

export function PerkDetailsModal({ template, onClose }: PerkDetailsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="mb-md">{template.name}</h3>
        <p className="text-sm mb-md">{template.description}</p>
        
        {template.details && (
          <div className="mb-md p-md glass-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-sm m-0" style={{ lineHeight: 1.5 }}>{template.details}</p>
          </div>
        )}
        
        {template.usageLink && (
          <a   
            href={template.usageLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-block"
          >
            View Eligible Uses ↗
          </a>
        )}
        
        <button className="btn btn-primary btn-block mt-md" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
