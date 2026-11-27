interface DashboardQuickNavProps {
  hasBonuses: boolean;
  hasPerks: boolean;
  hasBestCards: boolean;
}

export function DashboardQuickNav({ hasBonuses, hasPerks, hasBestCards }: DashboardQuickNavProps) {
  if (!hasBonuses && !hasPerks && !hasBestCards) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="dashboard-quick-nav" aria-label="Dashboard quick jump">
      {hasBonuses && (
        <button
          type="button"
          className="quick-jump-pill"
          onClick={() => scrollToSection('dashboard-bonuses')}
        >
          🎯 Bonuses
        </button>
      )}
      {hasPerks && (
        <button
          type="button"
          className="quick-jump-pill"
          onClick={() => scrollToSection('dashboard-perks')}
        >
          🎁 Unused Perks
        </button>
      )}
      {hasBestCards && (
        <button
          type="button"
          className="quick-jump-pill"
          onClick={() => scrollToSection('dashboard-best-card')}
        >
          ⚡ Best Card
        </button>
      )}
    </nav>
  );
}
