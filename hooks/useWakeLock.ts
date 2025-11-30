import { useEffect, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(console.error);
        sentinelRef.current = null;
      }
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          sentinelRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    // Re-acquire lock if visibility changes (user switches tabs and comes back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(console.error);
        sentinelRef.current = null;
      }
    };
  }, [isActive]);
};