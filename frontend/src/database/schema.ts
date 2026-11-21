/**
 * Nirikshan Local IndexedDB Schema Definitions (Dexie.js)
 * Phase 2 - Offline-first foundation
 */

export type SyncStatus = 'synced' | 'pending_sync' | 'draft' | 'conflict';
export type PhotoSyncStatus = 'synced' | 'pending_sync' | 'failed';
export type SyncQueueStatus = 'pending' | 'syncing' | 'failed' | 'completed';
export type EntityType = 'inspection' | 'photo' | 'checklist';

/**
 * Local Inspection Record
 * Stores inspection checklists completed or drafted locally
 */
export interface LocalInspection {
  id: string; // UUID or local identifier
  assignmentId: string;
  siteId: string;
  siteName?: string;
  templateName?: string;
  inspectorId?: string;
  answers: Record<string, unknown>;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  serverVersion: number;
  localRevision: number;
  syncStatus: SyncStatus;
  createdAt?: string;
  updatedAt: string;
}

/**
 * Local Photo Evidence
 * Stores captured photographs as Blobs locally before upload
 */
export interface LocalPhoto {
  id: string;
  inspectionId: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number;
  syncStatus: PhotoSyncStatus;
  createdAt: string;
}

/**
 * Sync Queue Item
 * Tracks queued mutations for the background sync engine
 */
export interface SyncQueueItem {
  id: string;
  entityId: string;
  entityType: EntityType;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  status: SyncQueueStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt?: string;
}
