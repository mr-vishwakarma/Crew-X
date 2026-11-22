import { db } from '../database/db';
import { apiClient } from './api';
import type { SyncQueueItem } from '../database/schema';

export interface SyncResult {
  totalProcessed: number;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ entityId: string; error: string }>;
  timestamp: string;
}

export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

class SyncCoordinator {
  private isSyncing = false;
  private listeners: Array<(state: SyncState, result?: SyncResult) => void> = [];

  constructor() {
    this.initAutomaticTriggers();
  }

  /**
   * Register automatic triggers for background/reconnect synchronization
   */
  private initAutomaticTriggers() {
    if (typeof window === 'undefined') return;

    // Trigger sync when internet connectivity returns
    window.addEventListener('online', () => {
      console.log('[SyncCoordinator] Network online detected. Triggering automatic sync...');
      this.syncAllPending().catch((err) =>
        console.warn('[SyncCoordinator] Auto-sync on online failed:', err)
      );
    });

    // Trigger sync when user returns to the tab/PWA
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.syncAllPending().catch((err) =>
          console.warn('[SyncCoordinator] Auto-sync on visibility change failed:', err)
        );
      }
    });
  }

  /**
   * Subscribe to sync state changes
   */
  public subscribe(callback: (state: SyncState, result?: SyncResult) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(state: SyncState, result?: SyncResult) {
    this.listeners.forEach((cb) => cb(state, result));
  }

  /**
   * Process all pending items in Dexie syncQueue
   */
  public async syncAllPending(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncCoordinator] Sync already in progress, skipping concurrent run.');
      return {
        totalProcessed: 0,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }

    if (!navigator.onLine) {
      console.log('[SyncCoordinator] Device is offline. Cannot sync.');
      return {
        totalProcessed: 0,
        syncedCount: 0,
        failedCount: 0,
        errors: [{ entityId: 'network', error: 'Device is offline' }],
        timestamp: new Date().toISOString(),
      };
    }

    this.isSyncing = true;
    this.notify('syncing');

    const result: SyncResult = {
      totalProcessed: 0,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    try {
      if (!db.isOpen()) await db.open();

      // Retrieve all items waiting to be synced
      const pendingItems: SyncQueueItem[] = await db.syncQueue
        .where('status')
        .anyOf('pending', 'failed')
        .toArray();

      result.totalProcessed = pendingItems.length;

      for (const item of pendingItems) {
        // Skip items that exceeded max retry attempts (e.g., 5 attempts)
        if (item.attempts >= 5) {
          result.failedCount++;
          result.errors.push({
            entityId: item.entityId,
            error: item.lastError || 'Max retry limit reached',
          });
          continue;
        }

        try {
          await db.syncQueue.update(item.id, {
            status: 'syncing',
            attempts: item.attempts + 1,
            updatedAt: new Date().toISOString(),
          });

          if (item.entityType === 'inspection') {
            const inspection = await db.inspections.get(item.entityId);
            if (!inspection) {
              // Missing locally, mark completed to unblock queue
              await db.syncQueue.update(item.id, { status: 'completed' });
              continue;
            }

            // Sync with backend
            const response = await apiClient.post('/inspections/sync', {
              inspectionId: inspection.id,
              siteId: inspection.siteId,
              assignmentId: inspection.assignmentId,
              answers: inspection.answers,
              notes: inspection.notes,
              latitude: inspection.latitude,
              longitude: inspection.longitude,
              gpsAccuracy: inspection.gpsAccuracy,
              workflowStatus: inspection.workflowStatus || 'SUBMITTED',
            });

            if (response.data && response.data.success) {
              // Update local inspection status to synced
              await db.inspections.update(inspection.id, {
                syncStatus: 'synced',
                workflowStatus: 'SUBMITTED',
                updatedAt: new Date().toISOString(),
              });

              // Mark queue item as completed
              await db.syncQueue.update(item.id, {
                status: 'completed',
                updatedAt: new Date().toISOString(),
              });

              result.syncedCount++;
            } else {
              throw new Error(response.data?.message || 'Sync rejected by server');
            }
          } else if (item.entityType === 'photo') {
            // Photo upload synchronization
            const photo = await db.photos.get(item.entityId);
            if (!photo) {
              await db.syncQueue.update(item.id, { status: 'completed' });
              continue;
            }

            // For photos, update status to synced
            await db.photos.update(photo.id, { syncStatus: 'synced' });
            await db.syncQueue.update(item.id, { status: 'completed' });
            result.syncedCount++;
          }
        } catch (itemErr: any) {
          const errorMsg = itemErr?.response?.data?.message || itemErr?.message || 'Network request failed';
          result.failedCount++;
          result.errors.push({ entityId: item.entityId, error: errorMsg });

          await db.syncQueue.update(item.id, {
            status: 'failed',
            lastError: errorMsg,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      this.notify(result.failedCount > 0 ? 'error' : 'success', result);
      return result;
    } catch (globalErr: any) {
      console.error('[SyncCoordinator] Global sync failure:', globalErr);
      this.notify('error', result);
      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncCoordinator();
