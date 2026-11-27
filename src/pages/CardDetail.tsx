import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate, removeCard } from '../db/helpers';
import { useEffect, useRef, useState } from 'react';
import { CardHeader } from '../components/CardHeader';
import { SignupBonusSection } from '../components/SignupBonusSection';
import { EarningRatesSection } from '../components/EarningRatesSection';
import { PerksSection } from '../components/PerksSection';
import { ProductChangeModal } from '../components/ProductChangeModal';
import { QuarterlyRewardsSection } from '../components/QuarterlyRewardsSection';
import { hasRotatingRewards } from '../utils/quarterly-rewards';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useModalEscape } from '../hooks/useModalEscape';
import { WalletMasterSidebar } from '../components/WalletMasterPane';

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cardId = Number(id);
  const isLandscapeDuo = useMediaQuery('(min-width: 780px)');
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocusCardIdRef = useRef<number | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const queriedCard = useLiveQuery(() => db.cards.get(cardId), [cardId]);
  const queriedBonus = useLiveQuery(() => db.signupBonuses.where('cardId').equals(cardId).first(), [cardId]);
  const queriedPerks = useLiveQuery(() => db.perks.where('cardId').equals(cardId).toArray(), [cardId]);
  const queriedQuarterlyRewards = useLiveQuery(() => db.quarterlyRewards.where('cardId').equals(cardId).toArray(), [cardId]);

  const card = queriedCard?.id === cardId ? queriedCard : undefined;
  const bonus = queriedBonus?.cardId === cardId ? queriedBonus : undefined;
  const perks = queriedPerks?.every(p => p.cardId === cardId) ? queriedPerks : undefined;
  const quarterlyRewards = queriedQuarterlyRewards?.every(r => r.cardId === cardId) ? queriedQuarterlyRewards : undefined;

  const [deleteTargetCardId, setDeleteTargetCardId] = useState<number | null>(null);
  const [productChangeTargetCardId, setProductChangeTargetCardId] = useState<number | null>(null);

  const showDelete = deleteTargetCardId === cardId;
  const showProductChange = productChangeTargetCardId === cardId;
  const deleteDialogRef = useModalEscape<HTMLDivElement>(() => setDeleteTargetCardId(null), showDelete);

  useEffect(() => {
    if (card && pendingFocusCardIdRef.current === cardId && detailHeadingRef.current) {
      detailHeadingRef.current.focus();
      pendingFocusCardIdRef.current = null;
    }
  }, [card, cardId]);

  const handleSelectFromMaster = (cardName: string, targetCardId?: number) => {
    pendingFocusCardIdRef.current = targetCardId ?? null;
    setLiveAnnouncement(`Selected ${cardName}`);
    if (targetCardId === cardId && detailHeadingRef.current) {
      detailHeadingRef.current.focus();
      pendingFocusCardIdRef.current = null;
    }
  };

  if (!card) {
    return (
      <div className="duo-master-detail-shell">
        {isLandscapeDuo && (
          <WalletMasterSidebar selectedCardId={cardId} onSelectCard={handleSelectFromMaster} />
        )}
        <div className="page"><p className="text-muted">Loading...</p></div>
      </div>
    );
  }

  const template = getCardTemplate(card.cardTemplateId);
  if (!template) {
    return (
      <div className="duo-master-detail-shell">
        {isLandscapeDuo && (
          <WalletMasterSidebar selectedCardId={cardId} onSelectCard={handleSelectFromMaster} />
        )}
        <div className="page"><p className="text-muted">Card template not found.</p></div>
      </div>
    );
  }

  const handleDelete = async () => {
    await removeCard(cardId);
    navigate('/cards');
  };

  const handleProductChangeSuccess = (newCardId: number) => {
    setProductChangeTargetCardId(null);
    navigate(`/card/${newCardId}`);
  };

  return (
    <div className="duo-master-detail-shell">
      {isLandscapeDuo && (
        <WalletMasterSidebar selectedCardId={cardId} onSelectCard={handleSelectFromMaster} />
      )}
      <div key={`card-detail-${cardId}`} className="page animate-in" data-testid="card-detail-pane">
        <div className="sr-only" aria-live="polite">{liveAnnouncement}</div>
        <h2 ref={detailHeadingRef} tabIndex={-1} className="sr-only duo-detail-heading">
          {card.nickname || template.name}
        </h2>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <CardHeader key={`header-${cardId}`} card={card} template={template} />

        {bonus && <SignupBonusSection key={`bonus-${cardId}`} bonus={bonus} />}

        <EarningRatesSection earningRates={template.earningRates} />

        {hasRotatingRewards(template, quarterlyRewards) && (
          <QuarterlyRewardsSection key={`quarterly-${cardId}`} card={card} template={template} />
        )}

        {perks && <PerksSection key={`perks-${cardId}`} perks={perks} template={template} />}

        {card.status === 'active' ? (
          <div className="flex gap-sm mt-lg">
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setProductChangeTargetCardId(cardId)}
            >
              Upgrade / Downgrade
            </button>
            <button
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={() => setDeleteTargetCardId(cardId)}
            >
              Remove Card
            </button>
          </div>
        ) : (
          <div className="mt-lg">
            <div className="p-md glass-card text-center mb-md">
              <span className="badge badge-red">{card.status}</span>
              <p className="text-xs text-muted mt-sm">
                This card was {card.status === 'product-changed' ? 'product changed to another card' : 'closed'}.
              </p>
            </div>
            <button className="btn btn-danger btn-block" onClick={() => setDeleteTargetCardId(cardId)}>
              Remove Record
            </button>
          </div>
        )}

        {showProductChange && (
          <ProductChangeModal
            card={card}
            currentTemplate={template}
            onClose={() => setProductChangeTargetCardId(null)}
            onSuccess={handleProductChangeSuccess}
          />
        )}

        {showDelete && (
          <div className="modal-overlay" onClick={() => setDeleteTargetCardId(null)}>
            <div
              ref={deleteDialogRef}
              className="modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-card-modal-title"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-handle" />
              <h3 id="remove-card-modal-title" className="mb-md">Remove Card?</h3>
              <p className="text-sm text-muted mb-md">
                This will remove {template.name} and all its tracking data (bonus progress, perk history).
              </p>
              <div className="flex gap-sm">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteTargetCardId(null)}>Cancel</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
