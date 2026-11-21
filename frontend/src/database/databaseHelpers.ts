import { db } from './db';
import type { LocalInspection, SyncQueueItem } from './schema';

export interface DatabaseHealth {
  isAvailable: boolean;
  name: string;
  version: number;
  isPersistentStorage: boolean;
  tables: {
    inspectionsCount: number;
    photosCount: number;
    syncQueueCount: number;
  };
  error?: string;
}

/**
 * Checks if IndexedDB is available in the current browser environment
 */
export const isIndexedDBAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

/**
 * Request persistent browser storage so browser cache eviction does not wipe offline audits
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return true;
    } catch (err) {
      console.warn('[IndexedDB] Persistent storage request failed:', err);
      return false;
    }
  }
  return false;
};

/**
 * Retrieves database health metrics and table counts
 */
export const getDatabaseHealth = async (): Promise<DatabaseHealth> => {
  if (!isIndexedDBAvailable()) {
    return {
      isAvailable: false,
      name: 'NirikshanLocalDB',
      version: 0,
      isPersistentStorage: false,
      tables: { inspectionsCount: 0, photosCount: 0, syncQueueCount: 0 },
      error: 'IndexedDB is not supported in this browser.',
    };
  }

  try {
    if (!db.isOpen()) {
      await db.open();
    }

    const [inspectionsCount, photosCount, syncQueueCount, isPersisted] = await Promise.all([
      db.inspections.count(),
      db.photos.count(),
      db.syncQueue.count(),
      navigator.storage?.persisted ? navigator.storage.persisted() : Promise.resolve(false),
    ]);

    return {
      isAvailable: true,
      name: db.name,
      version: db.verno,
      isPersistentStorage: isPersisted,
      tables: {
        inspectionsCount,
        photosCount,
        syncQueueCount,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database initialization failed';
    return {
      isAvailable: false,
      name: 'NirikshanLocalDB',
      version: 0,
      isPersistentStorage: false,
      tables: { inspectionsCount: 0, photosCount: 0, syncQueueCount: 0 },
      error: message,
    };
  }
};

/**
 * Read the live count of items currently waiting to be synchronized
 */
export const getPendingSyncCount = async (): Promise<number> => {
  try {
    if (!db.isOpen()) await db.open();
    // Count items in syncQueue with status 'pending' or 'failed'
    const queueCount = await db.syncQueue
      .where('status')
      .anyOf('pending', 'failed', 'syncing')
      .count();

    return queueCount;
  } catch (err) {
    console.error('[IndexedDB] Error reading pending sync count:', err);
    return 0;
  }
};

/**
 * Read the count of local draft inspections
 */
export const getLocalDraftsCount = async (): Promise<number> => {
  try {
    if (!db.isOpen()) await db.open();
    return await db.inspections.where('syncStatus').equals('draft').count();
  } catch (err) {
    console.error('[IndexedDB] Error reading draft count:', err);
    return 0;
  }
};

/**
 * Fetch all locally saved inspection records
 */
export const getAllLocalInspections = async (): Promise<LocalInspection[]> => {
  try {
    if (!db.isOpen()) await db.open();
    return await db.inspections.orderBy('updatedAt').reverse().toArray();
  } catch (err) {
    console.error('[IndexedDB] Error fetching local inspections:', err);
    return [];
  }
};

/**
 * Helper to create a sample local draft inspection and queue item for testing/demo purposes
 */
export const createDemoLocalInspection = async (
  siteName = 'Metro Station North Wing',
  templateName = 'Civil Structure & Safety Checklist'
): Promise<LocalInspection> => {
  const id = `local_insp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const inspection: LocalInspection = {
    id,
    assignmentId: `asg_${Date.now()}`,
    siteId: `site_${Math.floor(Math.random() * 1000)}`,
    siteName,
    templateName,
    answers: {
      q1_safety_gear: 'compliant',
      q2_perimeter_fence: 'compliant',
      q3_hazardous_materials: 'none_detected',
    },
    notes: 'Pre-shift perimeter inspection completed offline. No structural cracks observed.',
    latitude: 28.6139,
    longitude: 77.209,
    gpsAccuracy: 4.8,
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'pending_sync',
    createdAt: now,
    updatedAt: now,
  };

  const queueItem: SyncQueueItem = {
    id: `queue_${id}`,
    entityId: id,
    entityType: 'inspection',
    action: 'CREATE',
    status: 'pending',
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', db.inspections, db.syncQueue, async () => {
    await db.inspections.add(inspection);
    await db.syncQueue.add(queueItem);
  });

  return inspection;
};

/**
 * Clear all demo records from local IndexedDB (utility for testing)
 */
export const clearLocalDatabase = async (): Promise<void> => {
  if (!db.isOpen()) await db.open();
  await db.transaction('rw', db.inspections, db.photos, db.syncQueue, async () => {
    await db.inspections.clear();
    await db.photos.clear();
    await db.syncQueue.clear();
  });
};
