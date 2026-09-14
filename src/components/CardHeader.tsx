import { useState } from 'react';
import type { UserCard, CardTemplate } from '../db/types';
import { updateCard } from '../db/helpers';
import { useToast } from './ToastContext';
import { getTextColorForBackground } from '../utils/color';

interface CardHeaderProps {
  card?: UserCard;
  template: CardTemplate;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function CardHeader({ card, template }: CardHeaderProps) {
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [editNickname, setEditNickname] = useState(card?.nickname || '');
  const [editLastFour, setEditLastFour] = useState(card?.lastFourDigits || '');
  const [editFeeDate, setEditFeeDate] = useState(card?.annualFeeDate || '');
  const [updating, setUpdating] = useState(false);
  const validLastFour = editLastFour === '' || /^\d{4}$/.test(editLastFour);
  const { showToast } = useToast();

  const handleEditDetails = async () => {
    if (!card?.id || !validLastFour || updating) return;
    setUpdating(true);
    try {
      await updateCard(card.id, {
        nickname: editNickname || undefined,
        lastFourDigits: editLastFour || undefined,
        annualFeeDate: editFeeDate,
      });
      setShowEditDetails(false);
      showToast('Card updated!');
    } catch {
      showToast('Could not update card. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="card-tile mt-sm" style={{ background: template.color, color: getTextColorForBackground(template.color) }}>
        <div className="card-issuer">{template.issuer}</div>
        <div className="card-name">{card?.nickname || template.name}</div>
        <div className="flex justify-between items-end">
          <div className="card-fee">${template.annualFee}/yr</div>
          {card && (
            <div className="text-right">
              <div className="text-xs" style={{ opacity: 0.8 }}>Next Annual Fee</div>
              <div className={`font-bold ${daysUntil(card.annualFeeDate) <= 30 ? 'text-gold' : ''}`} style={{ fontSize: '0.9rem' }}>
                {card.annualFeeDate}
                {daysUntil(card.annualFeeDate) <= 30 && daysUntil(card.annualFeeDate) >= 0 && (
                  <span className="ml-xs">({daysUntil(card.annualFeeDate)}d)</span>
                )}
              </div>
            </div>
          )}
        </div>
        {card && (
          <div className="flex justify-between items-center gap-sm mt-md">
            <div className="card-last-four">{card.lastFourDigits ? `•••• ${card.lastFourDigits}` : 'No card number saved'}</div>
            <button
              className="btn btn-secondary"
              style={{ background: 'transparent', color: 'inherit', minHeight: 44 }}
              onClick={() => {
                setEditNickname(card.nickname || '');
                setEditLastFour(card.lastFourDigits || '');
                setEditFeeDate(card.annualFeeDate);
                setShowEditDetails(true);
              }}
              aria-label="Edit card details"
            >
              Edit card details
            </button>
          </div>
        )}
      </div>

      {template.requirements && template.requirements.length > 0 && (
        <div className="glass-card mt-md card-requirements">
          <h3 className="section-title">Requirements</h3>
          <ul className="text-sm text-muted" style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            {template.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
          </ul>
        </div>
      )}

      {showEditDetails && (
        <div className="modal-overlay" onClick={() => setShowEditDetails(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); void handleEditDetails(); }}>
            <div className="modal-handle" />
            <h3 className="mb-md">Edit Card Details</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="edit-card-nickname">Nickname</label>
              <input id="edit-card-nickname" className="form-input" value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="e.g. My primary travel card" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-card-last-four">Last 4 Digits</label>
              <input id="edit-card-last-four" type="text" inputMode="numeric" pattern="[0-9]{4}" aria-describedby="edit-card-number-help" className="form-input" value={editLastFour} onChange={e => setEditLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} />
              <p id="edit-card-number-help" className="text-sm text-muted mt-sm">Enter exactly 4 digits, or leave blank to remove the saved number.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-card-fee-date">Next Annual Fee Date</label>
              <input id="edit-card-fee-date" type="date" className="form-input" value={editFeeDate} onChange={e => setEditFeeDate(e.target.value)} />
            </div>

            <div className="flex gap-sm mt-lg">
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditDetails(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={updating || !validLastFour}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
