const familyLabels: Record<string, string> = {
  'chase-ultimate-rewards-consumer': 'Chase Ultimate Rewards Consumer',
  'chase-united': 'Chase United',
  'chase-marriott-bonvoy': 'Chase Marriott Bonvoy',
  'bilt-card-2.0': 'Bilt Card 2.0',
  'skypass-visa': 'SKYPASS Visa',
};

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
          {familyId === 'all' ? 'All Families' : (familyLabels[familyId] ?? familyId)}
        </button>
      ))}
    </div>
  );
}
