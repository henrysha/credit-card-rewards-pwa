import { useState } from 'react';
import { saveCardClosureDate } from '../db/helpers';
import { useModalEscape } from '../hooks/useModalEscape';
import { getLocalDateString } from '../utils/quarterly-rewards';

interface CloseCardModalProps {
  cardId: number;
  cardName: string;
  openedDate: string;
  closedDate?: string;
  status: 'active' | 'closed';
  onClose: () => void;
}

export default function CloseCardModal({ cardId, cardName, openedDate, closedDate, status, onClose }: CloseCardModalProps) {
  const today = getLocalDateString();
  const editing = status === 'closed';
  const [date, setDate] = useState(editing ? closedDate ?? '' : today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dismiss = () => { if (!saving) onClose(); };
  const dialogRef = useModalEscape<HTMLFormElement>(dismiss);

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <form
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-card-title"
        onClick={event => event.stopPropagation()}
        onSubmit={async event => {
          event.preventDefault();
          if (saving) return;
          setSaving(true);
          setError('');
          try {
            await saveCardClosureDate(cardId, date, status);
            onClose();
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Could not mark the card closed.');
            setSaving(false);
          }
        }}
      >
        <div className="modal-handle" />
        <h3 id="close-card-title" className="mb-md">{editing ? 'Edit Closure Date' : 'Mark Card Closed'}</h3>
        <p className="text-sm text-muted mb-md">Record when you closed {cardName}.</p>
        <div className="form-group">
          <label className="form-label" htmlFor="card-closure-date">Closure date</label>
          <input
            id="card-closure-date"
            className="form-input"
            type="date"
            value={date}
            min={openedDate}
            max={today}
            required
            disabled={saving}
            onChange={event => setDate(event.target.value)}
          />
        </div>
        {error && <p role="alert" className="text-sm">{error}</p>}
        <div className="flex gap-sm mt-lg">
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={dismiss}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !date || date < openedDate || date > today}>
            {editing ? 'Save Closure Date' : 'Mark Closed'}
          </button>
        </div>
      </form>
    </div>
  );
}
