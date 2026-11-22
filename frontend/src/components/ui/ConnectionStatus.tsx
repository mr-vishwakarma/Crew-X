import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Database, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getPendingSyncCount } from '../../database/databaseHelpers';

interface ConnectionStatusProps {
  showDbStatus?: boolean;
  dbHealthy?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDbStatus = true,
  dbHealthy = true,
  className = '',
}) => {
  const { isOnline, connectionState } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const updatePending = async () => {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    };

    updatePending();
    const interval = setInterval(updatePending, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* 1. Device Network Indicator */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          isOnline
            ? 'bg-slate-100 text-slate-800 border-slate-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
        title={isOnline ? 'Device network connected' : 'Device is offline'}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Device Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Device Offline</span>
          </>
        )}
      </div>

      {/* 2. Cloud Server API Reachability */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          connectionState === 'online'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : connectionState === 'server_unreachable'
            ? 'bg-orange-50 text-orange-800 border-orange-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}
        title={
          connectionState === 'online'
            ? 'Nirikshan Cloud backend reached'
            : connectionState === 'server_unreachable'
            ? 'Render Cloud backend unreachable'
            : 'Offline mode active'
        }
      >
        {connectionState === 'online' ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Cloud Connected</span>
          </>
        ) : connectionState === 'server_unreachable' ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-orange-600" />
            <span>Cloud Unreachable</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Cloud Offline</span>
          </>
        )}
      </div>

      {/* 3. IndexedDB Local Storage State */}
      {showDbStatus && (
        <div
          className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
            dbHealthy
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
          title="NirikshanLocalDB browser storage state"
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px]">IndexedDB Active</span>
        </div>
      )}

      {/* 4. Pending Outbox Sync Counter */}
      {pendingCount > 0 && (
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
          title={`${pendingCount} inspection mutation(s) waiting in local outbox`}
        >
          <RefreshCw className="w-3 h-3 text-amber-700" />
          <span>{pendingCount} Pending</span>
        </div>
      )}
    </div>
  );
};
