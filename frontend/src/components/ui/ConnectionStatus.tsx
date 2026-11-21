import React from 'react';
import { Wifi, WifiOff, Database } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface ConnectionStatusProps {
  showDbStatus?: boolean;
  dbHealthy?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDbStatus = false,
  dbHealthy = true,
  className = '',
}) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Network connectivity pill */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}
        title={
          isOnline
            ? 'Browser reports active network connection'
            : 'Offline: Changes will be stored in local IndexedDB'
        }
      >
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Optional IndexedDB status indicator */}
      {showDbStatus && (
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
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
    </div>
  );
};
