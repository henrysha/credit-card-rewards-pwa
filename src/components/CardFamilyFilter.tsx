import { getFamilyLabel } from '../db/helpers';
import type { CardFamilyId } from '../db/card-families';

interface CardFamilyFilterProps {
  familyIds: Array<'all' | CardFamilyId>;
  selectedFamilyId: 'all' | CardFamilyId;
  onSelect: (familyId: 'all' | CardFamilyId) => void;
}

export function CardFamilyFilter({ familyIds, selectedFamilyId, onSelect }: CardFamilyFilterProps) {
  return (
    <div className="tabs" role="group" aria-label="Card family filters">
      {familyIds.map(familyId => (
        <button
          key={familyId}
          className={`tab ${selectedFamilyId === familyId ? 'active' : ''}`}
          onClick={() => onSelect(familyId)}
        >
          {familyId === 'all' ? 'All Families' : getFamilyLabel(familyId)}
        </button>
      ))}
    </div>
  );
}
