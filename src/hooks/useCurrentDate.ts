import { useEffect, useState } from 'react';
import { getEffectiveDate, getMsUntilNextDateBoundary } from '../utils/quarterly-rewards';

/** Re-evaluate date-based UI at local midnight and after a suspended PWA resumes. */
export function useCurrentDate(): Date {
  const [now, setNow] = useState(() => getEffectiveDate());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, getMsUntilNextDateBoundary());
    };
    const refresh = () => {
      setNow(getEffectiveDate());
      schedule();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onMockDate = () => refresh();
    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('mockdatechange', onMockDate);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('mockdatechange', onMockDate);
    };
  }, []);

  return now;
}
