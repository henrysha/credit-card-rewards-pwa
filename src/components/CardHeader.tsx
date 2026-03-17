import { useState } from 'react';
import type { UserCard, CardTemplate } from '../db/types';
import { updateCard } from '../db/helpers';
import { useToast } from './ToastContext';
import { getTextColorForBackground } from '../utils/color';

interface CardHeaderProps {
  card: UserCard;
  template: CardTemplate;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function CardHeader({ card, template }: CardHeaderProps) {
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [editNickname, setEditNickname] = useState(card.nickname || '');
  const [editLastFour, setEditLastFour] = useState(card.lastFourDigits || '');
  const [editFeeDate, setEditFeeDate] = useState(card.annualFeeDate);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  const handleEditDetails = async () => {
    setUpdating(true);
    try {
      await updateCard(card.id!, {
        nickname: editNickname || undefined,
        lastFourDigits: editLastFour || undefined,
        annualFeeDate: editFeeDate,
      });
      setShowEditDetails(false);
      showToast('Card updated!');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="card-tile mt-sm" style={{ background: template.color, color: getTextColorForBackground(template.color) }}>
        <div className="card-issuer">{template.issuer}</div>
        <div className="card-name">{card.nickname || template.name}</div>
        <div className="flex justify-between items-end">
          <div className="card-fee">${template.annualFee}/yr</div>
          <div className="text-right">
            <div className="text-xs" style={{ opacity: 0.8 }}>Next Annual Fee</div>
            <div className={`font-bold ${daysUntil(card.annualFeeDate) <= 30 ? 'text-gold' : ''}`} style={{ fontSize: '0.9rem' }}>
              {card.annualFeeDate}
              {daysUntil(card.annualFeeDate) <= 30 && daysUntil(card.annualFeeDate) >= 0 && (
                <span className="ml-xs">({daysUntil(card.annualFeeDate)}d)</span>
              )}
              <button 
                className="ml-sm" 
                style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, opacity: 0.7, cursor: 'pointer' }}
                onClick={() => {
                  setEditNickname(card.nickname || '');
                  setEditLastFour(card.lastFourDigits || '');
                  setEditFeeDate(card.annualFeeDate);
                  setShowEditDetails(true);
                }}
                aria-label="Edit card details"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {card.lastFourDigits && <div className="card-last-four" style={{ marginTop: 8 }}>•••• {card.lastFourDigits}</div>}
      </div>

      {showEditDetails && (
        <div className="modal-overlay" onClick={() => setShowEditDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Edit Card Details</h3>
            
            <div className="form-group">
              <label className="form-label">Nickname</label>
              <input className="form-input" value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="e.g. My primary travel card" />
            </div>

            <div className="form-group">
              <label className="form-label">Last 4 Digits</label>
              <input className="form-input" value={editLastFour} onChange={e => setEditLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} />
            </div>

            <div className="form-group">
              <label className="form-label">Next Annual Fee Date</label>
              <input type="date" className="form-input" value={editFeeDate} onChange={e => setEditFeeDate(e.target.value)} />
            </div>

            <div className="flex gap-sm mt-lg">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditDetails(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleEditDetails} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
