import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

export type ConnectionState = 'online' | 'offline' | 'server_unreachable';

export interface NetworkStatus {
  isOnline: boolean;
  isServerReachable: boolean;
  connectionState: ConnectionState;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  checkReachability: () => Promise<boolean>;
}

/**
 * Hook to reactively monitor browser network connectivity and actual API server reachability
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isServerReachable, setIsServerReachable] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(() => (isOnline ? new Date() : null));

  const checkReachability = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsServerReachable(false);
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      await apiClient.get('/health', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsServerReachable(true);
      return true;
    } catch {
      // Server timed out or returned error
      setIsServerReachable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());
      checkReachability();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      checkReachability();
    } else {
      setIsServerReachable(false);
    }

    // Ping check every 30 seconds while window is focused
    const intervalId = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        checkReachability();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkReachability]);

  let connectionState: ConnectionState = 'online';
  if (!isOnline) {
    connectionState = 'offline';
  } else if (!isServerReachable) {
    connectionState = 'server_unreachable';
  }

  return {
    isOnline,
    isServerReachable,
    connectionState,
    wasOffline,
    lastOnlineAt,
    checkReachability,
  };
};
