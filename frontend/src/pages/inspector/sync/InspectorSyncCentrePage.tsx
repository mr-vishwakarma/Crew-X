import React, { useEffect, useState, useCallback } from 'react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import {
  getDatabaseHealth,
  getAllLocalInspections,
  clearLocalDatabase,
  type DatabaseHealth,
} from '../../../database/databaseHelpers';
import { db } from '../../../database/db';
import type { SyncQueueItem, LocalInspection } from '../../../database/schema';
import { syncService, type SyncResult } from '../../../services/sync.service';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  RefreshCw,
  Database,
  HardDrive,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  MapPin,
  Calendar,
} from 'lucide-react';

export const InspectorSyncCentrePage: React.FC = () => {
  const { isOnline, connectionState } = useNetworkStatus();

  // Storage and Queue State
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [localInspections, setLocalInspections] = useState<LocalInspection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const health = await getDatabaseHealth();
      setDbHealth(health);

      if (!db.isOpen()) await db.open();
      const items = await db.syncQueue.orderBy('createdAt').reverse().toArray();
      setQueueItems(items);

      const inspections = await getAllLocalInspections();
      setLocalInspections(inspections);
    } catch (err) {
      console.error('[SyncCentre] Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to sync service events
    const unsubscribe = syncService.subscribe((state, result) => {
      if (state === 'syncing') {
        setIsSyncing(true);
      } else {
        setIsSyncing(false);
        loadData();

        if (state === 'success' && result) {
          setSyncFeedback({
            type: 'success',
            text: `Successfully synced ${result.syncedCount} inspection record(s) to cloud!`,
          });
        } else if (state === 'error' && result) {
          setSyncFeedback({
            type: 'error',
            text: `Sync finished with ${result.failedCount} error(s). Unsynced records remain preserved in IndexedDB.`,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncFeedback({
        type: 'error',
        text: 'Cannot sync: Device is currently offline. Connect to Wi-Fi or cellular network.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const result: SyncResult = await syncService.syncAllPending();
      if (result.syncedCount > 0) {
        setSyncFeedback({
          type: 'success',
          text: `Synchronization complete! ${result.syncedCount} records confirmed by Nirikshan cloud.`,
        });
      } else if (result.failedCount > 0) {
        setSyncFeedback({
          type: 'error',
          text: `Sync completed with errors: ${result.errors.map((e) => e.error).join(', ')}`,
        });
      } else {
        setSyncFeedback({
          type: 'info',
          text: 'Sync queue is currently up to date. No pending items.',
        });
      }
      loadData();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        text: `Sync request failed: ${err?.message || 'Network error'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      await clearLocalDatabase();
      setConfirmClearOpen(false);
      setSyncFeedback({
        type: 'info',
        text: 'Local IndexedDB tables cleared.',
      });
      loadData();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        text: `Failed to clear storage: ${err?.message || 'Database error'}`,
      });
    }
  };

  const pendingCount = queueItems.filter((q) => q.status === 'pending' || q.status === 'syncing').length;

  return (
    <AuthenticatedLayout
      title="Field Sync Centre"
      subtitle="Offline Queue Diagnostics & Cloud Synchronization"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Action Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {connectionState === 'online'
                    ? 'CONNECTED TO CLOUD'
                    : connectionState === 'server_unreachable'
                    ? 'SERVER UNREACHABLE'
                    : 'OFFLINE MODE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Dexie.js IndexedDB v{dbHealth?.version || 2}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Offline Sync & Outbox
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                {pendingCount === 0
                  ? 'All local inspection reports and photo evidence are fully synchronized with MongoDB Atlas.'
                  : `You have ${pendingCount} local record(s) queued for synchronization.`}
              </p>
            </div>

            {/* Sync Now Button */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
                className="w-full sm:w-auto font-bold shadow-xs"
              >
                {isSyncing ? 'Synchronizing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <Alert
            type={syncFeedback.type === 'error' ? 'error' : syncFeedback.type === 'info' ? 'info' : 'success'}
            title={syncFeedback.type === 'error' ? 'Sync Notice' : 'Synchronization Status'}
            message={syncFeedback.text}
          />
        )}

        {/* Storage Diagnostics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Queue Backlog</span>
              <RefreshCw className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingCount}</div>
            <p className="text-[10px] text-slate-400">Awaiting cloud upload</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Local Inspections</span>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{localInspections.length}</div>
            <p className="text-[10px] text-slate-400">Stored in Dexie.js</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Photo Evidence</span>
              <HardDrive className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{dbHealth?.tables.photosCount || 0}</div>
            <p className="text-[10px] text-slate-400">Binary Blobs in IDB</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Storage State</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-extrabold text-emerald-600 mt-1">
              {dbHealth?.isPersistentStorage ? 'Persistent' : 'Active IDB'}
            </div>
            <p className="text-[10px] text-slate-400">
              {dbHealth?.storageEstimatedUsage
                ? `${Math.round(dbHealth.storageEstimatedUsage / 1024)} KB used`
                : 'Zero eviction risk'}
            </p>
          </div>
        </div>

        {/* Sync Queue Outbox Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                IndexedDB Outbox & Mutation Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mutations are saved immediately to local storage and retried automatically.
              </p>
            </div>
          </div>

          {queueItems.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Sync Queue Clean</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No inspection mutations or photo uploads are pending. All offline edits have reached the server.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Queued Time</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.entityType}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.action || 'MUTATION'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'syncing'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{item.attempts}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                        {item.lastError ? (
                          <span className="text-rose-600 font-semibold">{item.lastError}</span>
                        ) : (
                          <span className="font-mono text-[11px]">{item.entityId}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Locally Cached Inspections Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Locally Stored Inspections ({localInspections.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspections available offline for editing or review.
              </p>
            </div>
          </div>

          {localInspections.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No local inspections in IndexedDB.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {localInspections.map((insp) => (
                <div key={insp.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{insp.siteName || 'Site'}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          insp.syncStatus === 'synced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : insp.syncStatus === 'pending_sync'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {insp.syncStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {insp.projectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(insp.updatedAt).toLocaleDateString()}
                      </span>
                      {insp.latitude && (
                        <span className="text-[11px] text-blue-600 font-mono">
                          GPS Stamped
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.assign(`/inspector/checklist/${insp.id}`)}
                    className="text-xs font-semibold"
                  >
                    Open Checklist
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Storage Caution */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmClearOpen(true)}
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Local IndexedDB
          </Button>
        </div>

        {/* Confirmation Modal */}
        {confirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Clear Local Database?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will erase all locally drafted inspections, downloaded assignments, and cached photos in IndexedDB. Are you sure?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmClearOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleClearDatabase}>
                  Yes, Clear Storage
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
