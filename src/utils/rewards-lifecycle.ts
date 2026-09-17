import { syncCardPerks, refreshExpiredPerks } from '../db/helpers';
import { rotateQuarterlyRewards, getMsUntilNextDateBoundary } from './quarterly-rewards';
import { runNotificationChecks } from '../notifications';

/**
 * Initializes app rewards lifecycle:
 * - Serializes refreshes and quarterly rotations to prevent overlapping database writes.
 * - Schedules rotation at the next local date boundary (midnight).
 * - Refreshes on PWA resume (visibilitychange).
 * - Reacts to date changes in test/mock environments via mockdatechange.
 * - Disposed guard prevents re-arming timers or running queued refreshes after cleanup.
 */
export function setupRewardsLifecycle(): () => void {
  let disposed = false;
  let pending: Promise<void> | undefined;
  let rerunRequested = false;
  let boundaryTimer: ReturnType<typeof setTimeout> | undefined;

  const refresh = () => {
    if (disposed) return Promise.resolve();
    if (pending) {
      rerunRequested = true;
      return pending;
    }

    pending = (async () => {
      do {
        if (disposed) break;
        rerunRequested = false;
        await syncCardPerks();
        if (disposed) break;
        await refreshExpiredPerks();
        if (disposed) break;
        await rotateQuarterlyRewards();
        if (disposed) break;
        await runNotificationChecks();
      } while (rerunRequested && !disposed);
    })().catch(error => {
      if (!disposed) {
        console.error('Unable to refresh rewards', error);
      }
    }).finally(() => {
      pending = undefined;
    });

    return pending;
  };

  const scheduleNextDateBoundary = () => {
    if (disposed) return;
    if (boundaryTimer) clearTimeout(boundaryTimer);
    const msUntilMidnight = getMsUntilNextDateBoundary();
    boundaryTimer = setTimeout(async () => {
      if (disposed) return;
      await refresh();
      if (disposed) return;
      scheduleNextDateBoundary();
    }, msUntilMidnight);
  };

  // Initial load
  void refresh();
  scheduleNextDateBoundary();

  // Re-check when app comes to foreground (critical for mobile PWA)
  const handleVisibility = () => {
    if (disposed) return;
    if (document.visibilityState === 'visible') {
      void refresh();
      scheduleNextDateBoundary();
    }
  };

  const handleMockDateChange = () => {
    if (disposed) return;
    void refresh();
    scheduleNextDateBoundary();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('mockdatechange', handleMockDateChange);

  return () => {
    disposed = true;
    rerunRequested = false;
    if (boundaryTimer) {
      clearTimeout(boundaryTimer);
      boundaryTimer = undefined;
    }
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('mockdatechange', handleMockDateChange);
  };
}

if (typeof window !== 'undefined') {
  (window as unknown as { setupRewardsLifecycle: typeof setupRewardsLifecycle }).setupRewardsLifecycle = setupRewardsLifecycle;
}
