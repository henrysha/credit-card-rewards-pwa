import { syncCardPerks, refreshExpiredPerks } from '../db/helpers';
import { rotateQuarterlyRewards, getMsUntilNextDateBoundary, getLocalDateString } from './quarterly-rewards';
import { runNotificationChecks } from '../notifications';

/**
 * Initializes app rewards lifecycle:
 * - Serializes refreshes and quarterly rotations to prevent overlapping database writes.
 * - Schedules rotation at the next local date boundary (midnight).
 * - Refreshes on PWA resume (visibilitychange).
 * - Reacts to date changes in test/mock environments.
 */
export function setupRewardsLifecycle(): () => void {
  let pending: Promise<void> | undefined;
  let rerunRequested = false;
  let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
  let lastRotatedDate = getLocalDateString();

  const refresh = () => {
    if (pending) {
      rerunRequested = true;
      return pending;
    }

    pending = (async () => {
      do {
        rerunRequested = false;
        await syncCardPerks();
        await refreshExpiredPerks();
        await rotateQuarterlyRewards();
        await runNotificationChecks();
        lastRotatedDate = getLocalDateString();
      } while (rerunRequested);
    })().catch(error => {
      console.error('Unable to refresh rewards', error);
    }).finally(() => {
      pending = undefined;
    });

    return pending;
  };

  const scheduleNextDateBoundary = () => {
    if (boundaryTimer) clearTimeout(boundaryTimer);
    const msUntilMidnight = getMsUntilNextDateBoundary();
    boundaryTimer = setTimeout(async () => {
      await refresh();
      scheduleNextDateBoundary();
    }, msUntilMidnight);
  };

  // Initial load
  void refresh();
  scheduleNextDateBoundary();

  // Re-check when app comes to foreground (critical for mobile PWA)
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      void refresh();
      scheduleNextDateBoundary();
    }
  };

  const handleMockDateChange = () => {
    void refresh();
    scheduleNextDateBoundary();
  };

  // In-memory date check that triggers rotation only when local calendar date shifts across midnight
  // Avoids continuous IndexedDB polling while retaining support for clock shifts
  const dateCheckInterval = setInterval(() => {
    const today = getLocalDateString();
    if (today !== lastRotatedDate) {
      void refresh();
      scheduleNextDateBoundary();
    }
  }, 1000);

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('mockdatechange', handleMockDateChange);

  return () => {
    if (boundaryTimer) clearTimeout(boundaryTimer);
    clearInterval(dateCheckInterval);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('mockdatechange', handleMockDateChange);
  };
}
