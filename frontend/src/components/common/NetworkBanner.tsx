import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiOff, AlertTriangle } from 'lucide-react';

export const NetworkBanner: React.FC = () => {
  const { connectionState } = useNetworkStatus();

  if (connectionState === 'online') {
    return null;
  }

  return (
    <aside aria-label="Network Connectivity Notice" className="w-full">
      {connectionState === 'offline' ? (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>
              <strong>Field Offline Mode:</strong> You are currently working offline. Inspection checklists, photo evidence, and GPS coordinates will continue saving locally in Dexie.js IndexedDB.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-orange-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="h-4 w-4 shrink-0 text-white" />
            <span>
              <strong>Cloud Server Unreachable:</strong> Device is connected to network, but the Nirikshan cloud server cannot be reached. Unsynced changes will remain safely queued in local storage.
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
