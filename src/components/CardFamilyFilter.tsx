import { getFamilyLabel } from '../db/helpers';

interface CardFamilyFilterProps {
  familyIds: string[];
  selectedFamilyId: string;
  onSelect: (familyId: string) => void;
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
