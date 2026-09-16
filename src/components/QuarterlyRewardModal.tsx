import React, { useState } from 'react';
import {
  getCurrentQuarter,
  getNextQuarter,
  formatDateLabel,
  addQuarterlyReward,
} from '../utils/quarterly-rewards';
import { useToast } from './ToastContext';

interface QuarterlyRewardModalProps {
  cardId: number;
  initialMode?: 'current' | 'next';
  onClose: () => void;
  onSuccess?: (rewardId: number) => void;
}

const POPULAR_CATEGORIES = [
  'Online Shopping',
  'Amazon.com',
  'Gas',
  'Groceries',
  'Dining',
  'Wholesale Clubs',
  'Target',
  'PayPal',
  'Select Live Entertainment',
];

export function QuarterlyRewardModal({
  cardId,
  initialMode = 'next',
  onClose,
  onSuccess,
}: QuarterlyRewardModalProps) {
  const { showToast } = useToast();
  const currentQ = getCurrentQuarter();
  const nextQ = getNextQuarter();

  const [selectedQuarterMode, setSelectedQuarterMode] = useState<'current' | 'next'>(initialMode);
  const [category, setCategory] = useState('');
  const [multiplier, setMultiplier] = useState(5);
  const [limit, setLimit] = useState('Up to $1,500/quarter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const targetQuarter = selectedQuarterMode === 'next' ? nextQ : currentQ;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      setError('Please enter a category');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const rewardId = await addQuarterlyReward({
        cardId,
        category: category.trim(),
        multiplier: Number(multiplier) || 5,
        limit: limit.trim() || undefined,
        quarter: targetQuarter.quarter,
        year: targetQuarter.year,
      });

      const msg =
        selectedQuarterMode === 'next'
          ? `Queued ${category.trim()} (5x) for ${targetQuarter.label}!`
          : `Added ${category.trim()} (5x) to ${targetQuarter.label}!`;
      showToast(msg);

      if (onSuccess) onSuccess(rewardId);
      onClose();
    } catch (err) {
      console.error('Failed to add quarterly reward:', err);
      setError('Failed to save reward. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        data-testid="quarterly-reward-modal"
      >
        <div className="modal-handle" />
        <h3 className="mb-md">
          {selectedQuarterMode === 'next' ? 'Queue Next Quarter Reward' : 'Add Current Quarter Reward'}
        </h3>

        {error && (
          <div className="badge badge-red mb-md" style={{ width: '100%', padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Target Quarter</label>
            <select
              className="form-input form-select"
              data-testid="quarter-select"
              value={selectedQuarterMode}
              onChange={(e) => setSelectedQuarterMode(e.target.value as 'current' | 'next')}
            >
              <option value="next">
                Next Quarter: {nextQ.label} (Starts {formatDateLabel(nextQ.startDate)})
              </option>
              <option value="current">
                Current Quarter: {currentQ.label} (Active Now)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              data-testid="reward-category-input"
              placeholder="e.g. Amazon.com, Gas, Groceries"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-xs mt-xs">
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className="btn btn-secondary btn-sm text-[11px] py-[2px] px-[8px]"
                  style={{ borderRadius: '12px' }}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Multiplier</label>
            <div className="flex items-center gap-xs">
              <input
                type="number"
                step="0.5"
                min="1"
                max="20"
                className="form-input"
                data-testid="reward-multiplier-input"
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                required
              />
              <span className="text-gold font-bold text-lg">x</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quarterly Limit (Optional)</label>
            <input
              type="text"
              className="form-input"
              data-testid="reward-limit-input"
              placeholder="e.g. Up to $1,500/quarter"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>

          <div className="flex gap-sm mt-lg">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              data-testid="save-reward-btn"
              disabled={isSubmitting}
            >
              {selectedQuarterMode === 'next' ? 'Queue Reward' : 'Save Reward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
