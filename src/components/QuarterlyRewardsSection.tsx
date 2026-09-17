import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { UserCard, CardTemplate } from '../db/types';
import {
  getCurrentQuarter,
  getNextQuarter,
  formatDateLabel,
  removeQuarterlyReward,
} from '../utils/quarterly-rewards';
import { QuarterlyRewardModal } from './QuarterlyRewardModal';
import { useToast } from './ToastContext';

interface QuarterlyRewardsSectionProps {
  card: UserCard;
  template: CardTemplate;
}

export function QuarterlyRewardsSection({ card, template }: QuarterlyRewardsSectionProps) {
  const cardId = card.id!;
  const { showToast } = useToast();

  const currentQ = getCurrentQuarter();
  const nextQ = getNextQuarter();

  const rewards = useLiveQuery(
    () => db.quarterlyRewards.where('cardId').equals(cardId).toArray(),
    [cardId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'current' | 'next'>('next');

  const activeRewards = (rewards ?? []).filter(
    (r) => r.status === 'active' || (r.quarter === currentQ.quarter && r.year === currentQ.year && r.status !== 'expired')
  );

  const queuedRewards = (rewards ?? []).filter(
    (r) => r.status === 'queued'
  );

  const handleDelete = async (rewardId: number, category: string) => {
    await removeQuarterlyReward(rewardId);
    showToast(`Removed ${category}`);
  };

  const openModal = (mode: 'current' | 'next') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="glass-card mt-md" data-testid="quarterly-rewards-section">
      <div className="section-header flex justify-between items-center mb-sm">
        <h3 className="section-title">Rotating 5x Categories</h3>
        <button
          className="btn btn-primary btn-sm"
          data-testid="queue-next-quarter-btn"
          onClick={() => openModal('next')}
        >
          + Queue Next Quarter
        </button>
      </div>

      <p className="text-xs text-secondary mb-md">
        {template.name} earns 5% (5x) cash back on up to $1,500 in combined purchases in bonus categories each quarter upon activation.
      </p>

      {/* Current Quarter Section */}
      <div className="mb-md">
        <div className="flex justify-between items-center mb-xs">
          <div className="flex items-center gap-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Current Quarter ({currentQ.label})
            </span>
            <span className="badge badge-green">Active</span>
          </div>
          <button
            className="btn btn-secondary btn-sm text-xs py-[2px] px-sm"
            data-testid="add-current-quarter-btn"
            onClick={() => openModal('current')}
          >
            + Add
          </button>
        </div>

        {activeRewards.length === 0 ? (
          <div
            className="p-sm rounded text-xs text-muted"
            style={{ background: 'var(--bg-glass)', border: '1px dashed var(--bg-glass-border)' }}
          >
            No categories set for {currentQ.label}. Tap "+ Add" to specify this quarter's categories.
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {activeRewards.map((reward) => (
              <div
                key={reward.id}
                className="earning-rate flex items-center justify-between p-sm rounded"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}
                data-testid="active-reward-item"
                data-category={reward.category}
              >
                <div className="flex items-center gap-sm">
                  <div className="earning-multiplier text-gold font-bold">{reward.multiplier}x</div>
                  <div>
                    <div className="font-semibold text-white text-sm">{reward.category}</div>
                    {reward.limit && <div className="text-[11px] text-muted">{reward.limit}</div>}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm text-xs py-0 px-xs"
                  data-testid={`delete-reward-${reward.id}`}
                  onClick={() => handleDelete(reward.id!, reward.category)}
                  title="Remove category"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Quarter Queue Section */}
      <div>
        <div className="flex justify-between items-center mb-xs">
          <div className="flex items-center gap-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Next Quarter Queue ({nextQ.label})
            </span>
            <span className="badge badge-gold">Activates {formatDateLabel(nextQ.startDate)}</span>
          </div>
        </div>

        {queuedRewards.length === 0 ? (
          <div
            className="p-sm rounded text-xs text-muted"
            style={{ background: 'var(--bg-glass)', border: '1px dashed var(--bg-glass-border)' }}
          >
            No rewards queued for {nextQ.label}. When Chase announces next quarter categories, queue them here!
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {queuedRewards.map((reward) => (
              <div
                key={reward.id}
                className="earning-rate flex items-center justify-between p-sm rounded"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}
                data-testid="queued-reward-item"
                data-category={reward.category}
              >
                <div className="flex items-center gap-sm">
                  <div className="earning-multiplier text-gold font-bold">{reward.multiplier}x</div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className="font-semibold text-white text-sm">{reward.category}</span>
                      <span className="badge badge-gold text-[10px] py-0 px-[6px]">Queued</span>
                    </div>
                    {reward.limit && <div className="text-[11px] text-muted">{reward.limit}</div>}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm text-xs py-0 px-xs"
                  data-testid={`delete-queued-reward-${reward.id}`}
                  onClick={() => handleDelete(reward.id!, reward.category)}
                  title="Remove from queue"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <QuarterlyRewardModal
          cardId={cardId}
          initialMode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
