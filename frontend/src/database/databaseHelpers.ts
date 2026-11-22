import { db } from './db';
import type {
  LocalInspection,
  LocalPhoto,
  SyncQueueItem,
  DownloadedAssignment,
} from './schema';

export interface DatabaseHealth {
  isAvailable: boolean;
  name: string;
  version: number;
  isPersistentStorage: boolean;
  storageEstimatedUsage?: number;
  storageEstimatedQuota?: number;
  tables: {
    inspectionsCount: number;
    photosCount: number;
    syncQueueCount: number;
    downloadedAssignmentsCount: number;
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
 * Retrieves database health metrics, table counts, and storage estimate
 */
export const getDatabaseHealth = async (): Promise<DatabaseHealth> => {
  if (!isIndexedDBAvailable()) {
    return {
      isAvailable: false,
      name: 'NirikshanLocalDB',
      version: 0,
      isPersistentStorage: false,
      tables: {
        inspectionsCount: 0,
        photosCount: 0,
        syncQueueCount: 0,
        downloadedAssignmentsCount: 0,
      },
      error: 'IndexedDB is not supported in this browser.',
    };
  }

  try {
    if (!db.isOpen()) {
      await db.open();
    }

    const [
      inspectionsCount,
      photosCount,
      syncQueueCount,
      downloadedAssignmentsCount,
      isPersisted,
      estimate,
    ] = await Promise.all([
      db.inspections.count(),
      db.photos.count(),
      db.syncQueue.count(),
      db.downloadedAssignments.count(),
      navigator.storage?.persisted ? navigator.storage.persisted() : Promise.resolve(false),
      navigator.storage?.estimate ? navigator.storage.estimate() : Promise.resolve({ usage: 0, quota: 0 }),
    ]);

    return {
      isAvailable: true,
      name: db.name,
      version: db.verno,
      isPersistentStorage: isPersisted,
      storageEstimatedUsage: estimate.usage,
      storageEstimatedQuota: estimate.quota,
      tables: {
        inspectionsCount,
        photosCount,
        syncQueueCount,
        downloadedAssignmentsCount,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database initialization failed';
    return {
      isAvailable: false,
      name: 'NirikshanLocalDB',
      version: 0,
      isPersistentStorage: false,
      tables: {
        inspectionsCount: 0,
        photosCount: 0,
        syncQueueCount: 0,
        downloadedAssignmentsCount: 0,
      },
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
    return await db.syncQueue
      .where('status')
      .anyOf('pending', 'failed', 'syncing')
      .count();
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
    return await db.inspections
      .where('syncStatus')
      .equals('draft')
      .count();
  } catch (err) {
    console.error('[IndexedDB] Error reading draft count:', err);
    return 0;
  }
};

/**
 * Fetch all locally saved inspection records, optionally filtered by inspector
 */
export const getAllLocalInspections = async (inspectorId?: string): Promise<LocalInspection[]> => {
  try {
    if (!db.isOpen()) await db.open();
    let query = db.inspections.orderBy('updatedAt').reverse();
    const records = await query.toArray();
    if (inspectorId) {
      return records.filter((r) => !r.inspectorId || r.inspectorId === inspectorId);
    }
    return records;
  } catch (err) {
    console.error('[IndexedDB] Error fetching local inspections:', err);
    return [];
  }
};

/**
 * Fetch a single inspection by its local or remote ID
 */
export const getLocalInspectionById = async (id: string): Promise<LocalInspection | undefined> => {
  try {
    if (!db.isOpen()) await db.open();
    return await db.inspections.get(id);
  } catch (err) {
    console.error(`[IndexedDB] Error fetching inspection ${id}:`, err);
    return undefined;
  }
};

/**
 * Save or update an inspection record in Dexie.js
 * Automatically enqueues to syncQueue if marked pending_sync or submitted
 */
export const saveLocalInspection = async (
  record: Partial<LocalInspection> & { id: string; siteId: string; assignmentId: string }
): Promise<LocalInspection> => {
  if (!db.isOpen()) await db.open();

  const now = new Date().toISOString();
  const existing = await db.inspections.get(record.id);

  const updatedRecord: LocalInspection = {
    id: record.id,
    assignmentId: record.assignmentId,
    siteId: record.siteId,
    siteName: record.siteName ?? existing?.siteName ?? 'Construction Site',
    projectName: record.projectName ?? existing?.projectName ?? 'Project',
    templateName: record.templateName ?? existing?.templateName ?? 'Field Safety Checklist',
    inspectorId: record.inspectorId ?? existing?.inspectorId,
    organizationId: record.organizationId ?? existing?.organizationId,
    answers: record.answers ?? existing?.answers ?? {},
    notes: record.notes ?? existing?.notes ?? '',
    latitude: record.latitude ?? existing?.latitude ?? null,
    longitude: record.longitude ?? existing?.longitude ?? null,
    gpsAccuracy: record.gpsAccuracy ?? existing?.gpsAccuracy ?? null,
    serverVersion: record.serverVersion ?? existing?.serverVersion ?? 0,
    localRevision: (existing?.localRevision ?? 0) + 1,
    syncStatus: record.syncStatus ?? existing?.syncStatus ?? 'draft',
    workflowStatus: record.workflowStatus ?? existing?.workflowStatus ?? 'DRAFT',
    createdAt: existing?.createdAt ?? record.createdAt ?? now,
    updatedAt: now,
  };

  await db.transaction('rw', db.inspections, db.syncQueue, async () => {
    await db.inspections.put(updatedRecord);

    // If marked ready for submission or pending sync, ensure syncQueue has an entry
    if (updatedRecord.syncStatus === 'pending_sync' || updatedRecord.workflowStatus === 'SUBMITTED') {
      const queueId = `queue_${updatedRecord.id}`;
      const existingQueue = await db.syncQueue.get(queueId);
      const queueItem: SyncQueueItem = {
        id: queueId,
        entityId: updatedRecord.id,
        entityType: 'inspection',
        action: existing ? 'UPDATE' : 'CREATE',
        status: 'pending',
        attempts: existingQueue ? existingQueue.attempts : 0,
        payload: {
          inspectionId: updatedRecord.id,
          siteId: updatedRecord.siteId,
          assignmentId: updatedRecord.assignmentId,
          answers: updatedRecord.answers,
          notes: updatedRecord.notes,
          latitude: updatedRecord.latitude,
          longitude: updatedRecord.longitude,
          gpsAccuracy: updatedRecord.gpsAccuracy,
          workflowStatus: updatedRecord.workflowStatus,
        },
        createdAt: existingQueue ? existingQueue.createdAt : now,
        updatedAt: now,
      };
      await db.syncQueue.put(queueItem);
    }
  });

  return updatedRecord;
};

/**
 * Save a captured photo as a Blob in Dexie.js
 */
export const saveLocalPhoto = async (
  photoData: {
    inspectionId: string;
    blob: Blob;
    fileName: string;
    mimeType: string;
    caption?: string;
    latitude?: number | null;
    longitude?: number | null;
  }
): Promise<LocalPhoto> => {
  if (!db.isOpen()) await db.open();

  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const photo: LocalPhoto = {
    id,
    inspectionId: photoData.inspectionId,
    blob: photoData.blob,
    fileName: photoData.fileName,
    mimeType: photoData.mimeType,
    fileSizeBytes: photoData.blob.size,
    caption: photoData.caption,
    latitude: photoData.latitude,
    longitude: photoData.longitude,
    syncStatus: 'pending_sync',
    createdAt: now,
  };

  const queueItem: SyncQueueItem = {
    id: `queue_${id}`,
    entityId: id,
    entityType: 'photo',
    action: 'CREATE',
    status: 'pending',
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', db.photos, db.syncQueue, async () => {
    await db.photos.put(photo);
    await db.syncQueue.put(queueItem);
  });

  return photo;
};

/**
 * Fetch all local photos associated with an inspection
 */
export const getLocalPhotosByInspectionId = async (inspectionId: string): Promise<LocalPhoto[]> => {
  try {
    if (!db.isOpen()) await db.open();
    return await db.photos.where('inspectionId').equals(inspectionId).toArray();
  } catch (err) {
    console.error(`[IndexedDB] Error fetching photos for inspection ${inspectionId}:`, err);
    return [];
  }
};

/**
 * Delete a local photo from IndexedDB and sync queue
 */
export const deleteLocalPhoto = async (photoId: string): Promise<void> => {
  if (!db.isOpen()) await db.open();
  await db.transaction('rw', db.photos, db.syncQueue, async () => {
    await db.photos.delete(photoId);
    await db.syncQueue.delete(`queue_${photoId}`);
  });
};

/**
 * Download and store an assignment for offline access
 */
export const saveDownloadedAssignment = async (
  assignment: DownloadedAssignment
): Promise<DownloadedAssignment> => {
  if (!db.isOpen()) await db.open();
  await db.downloadedAssignments.put(assignment);
  return assignment;
};

/**
 * Get all downloaded assignments available offline
 */
export const getDownloadedAssignments = async (
  inspectorId?: string
): Promise<DownloadedAssignment[]> => {
  try {
    if (!db.isOpen()) await db.open();
    let assignments = await db.downloadedAssignments.toArray();
    if (inspectorId) {
      assignments = assignments.filter((a) => a.inspectorId === inspectorId);
    }
    return assignments;
  } catch (err) {
    console.error('[IndexedDB] Error fetching downloaded assignments:', err);
    return [];
  }
};

/**
 * Check if a specific assignment has been downloaded for offline access
 */
export const isAssignmentDownloaded = async (id: string): Promise<boolean> => {
  try {
    if (!db.isOpen()) await db.open();
    const item = await db.downloadedAssignments.get(id);
    return !!item;
  } catch {
    return false;
  }
};

/**
 * Create a demo offline inspection for diagnostics/testing
 */
export const createDemoLocalInspection = async (
  siteName = 'Metro Station North Wing',
  templateName = 'Civil Structure & Safety Checklist'
): Promise<LocalInspection> => {
  const id = `local_insp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return saveLocalInspection({
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
    syncStatus: 'pending_sync',
    workflowStatus: 'SUBMITTED',
  });
};

/**
 * Clear all records from local IndexedDB (utility for testing/reset)
 */
export const clearLocalDatabase = async (): Promise<void> => {
  if (!db.isOpen()) await db.open();
  await db.transaction('rw', db.inspections, db.photos, db.syncQueue, db.downloadedAssignments, async () => {
    await db.inspections.clear();
    await db.photos.clear();
    await db.syncQueue.clear();
    await db.downloadedAssignments.clear();
  });
};
