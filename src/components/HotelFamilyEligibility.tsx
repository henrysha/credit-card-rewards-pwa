import { getCardTemplate, getFamilyIds } from '../db/helpers';
import type { UserCard } from '../db/types';

interface HotelFamilyEligibilityProps {
  cards: UserCard[];
}

export default function HotelFamilyEligibility({ cards }: HotelFamilyEligibilityProps) {
  const hotelFamilyIds = getFamilyIds().filter(familyId => familyId === 'Hilton' || familyId === 'IHG');

  return (
    <>
      <div className="section-header mt-lg">
        <span className="section-title">Hotel Family Eligibility</span>
      </div>
      {hotelFamilyIds.map(familyId => {
        const familyCards = cards.filter(card => getCardTemplate(card.cardTemplateId)?.familyId === familyId);

        return (
          <div key={familyId} className="glass-card">
            <div className="flex justify-between items-center mb-md">
              <h3>{familyId}</h3>
              <span className={`badge ${familyCards.length === 0 ? 'badge-green' : 'badge-red'}`}>
                {familyCards.length === 0 ? 'No prior history' : 'Prior family history'}
              </span>
            </div>
            <div className="text-sm text-muted">
              {familyCards.length === 0
                ? `No ${familyId} cards in your history.`
                : `${familyCards.length} ${familyId} card${familyCards.length === 1 ? '' : 's'} in your history: ${familyCards.map(card => getCardTemplate(card.cardTemplateId)?.name).filter(Boolean).join(', ')}`}
            </div>
            <div className="text-xs text-muted mt-sm">Family history includes closed and product-changed cards.</div>
          </div>
        );
      })}
    </>
  );
}
