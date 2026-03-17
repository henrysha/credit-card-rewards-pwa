import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getCardTemplate, removeCard } from '../db/helpers';
import { useState } from 'react';
import { CardHeader } from '../components/CardHeader';
import { SignupBonusSection } from '../components/SignupBonusSection';
import { EarningRatesSection } from '../components/EarningRatesSection';
import { PerksSection } from '../components/PerksSection';

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cardId = Number(id);

  const card = useLiveQuery(() => db.cards.get(cardId), [cardId]);
  const bonus = useLiveQuery(() => db.signupBonuses.where('cardId').equals(cardId).first(), [cardId]);
  const perks = useLiveQuery(() => db.perks.where('cardId').equals(cardId).toArray(), [cardId]);

  const [showDelete, setShowDelete] = useState(false);

  if (!card) return <div className="page"><p className="text-muted">Loading...</p></div>;

  const template = getCardTemplate(card.cardTemplateId);
  if (!template) return <div className="page"><p className="text-muted">Card template not found.</p></div>;

  const handleDelete = async () => {
    await removeCard(cardId);
    navigate('/cards');
  };

  return (
    <div className="page animate-in">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <CardHeader card={card} template={template} />

      {bonus && <SignupBonusSection bonus={bonus} />}

      <EarningRatesSection earningRates={template.earningRates} />

      {perks && <PerksSection perks={perks} template={template} />}

      <div className="mt-lg">
        <button className="btn btn-danger btn-block" onClick={() => setShowDelete(true)}>Remove Card</button>
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="mb-md">Remove Card?</h3>
            <p className="text-sm text-muted mb-md">
              This will remove {template.name} and all its tracking data (bonus progress, perk history).
            </p>
            <div className="flex gap-sm">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
