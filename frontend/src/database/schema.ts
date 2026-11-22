/**
 * Nirikshan Local IndexedDB Schema Definitions (Dexie.js)
 * Offline-first foundation for Field Inspections & Progressive Web App
 */

export type SyncStatus = 'synced' | 'pending_sync' | 'draft' | 'conflict' | 'failed';
export type WorkflowStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';
export type PhotoSyncStatus = 'synced' | 'pending_sync' | 'failed';
export type SyncQueueStatus = 'pending' | 'syncing' | 'failed' | 'completed';
export type EntityType = 'inspection' | 'photo' | 'checklist' | 'assignment';

/**
 * Local Inspection Record
 * Stores inspection checklists completed or drafted locally
 */
export interface LocalInspection {
  id: string; // UUID or local identifier
  assignmentId: string;
  siteId: string;
  siteName?: string;
  siteCode?: string;
  projectName?: string;
  templateName?: string;
  inspectorId?: string;
  organizationId?: string;
  operationId?: string; // Idempotent submission tracking
  answers: Record<string, unknown>;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  gpsAltitude?: number | null;
  gpsAltitudeAccuracy?: number | null;
  gpsHeading?: number | null;
  gpsSpeed?: number | null;
  gpsCapturedAt?: string;
  gpsMethod?: string; // 'fresh_high_accuracy' | 'recent_cached' | 'watch_position'
  isGpsStale?: boolean;
  isLocationMandatory?: boolean;
  serverVersion: number;
  localRevision: number;
  syncStatus: SyncStatus;
  workflowStatus?: WorkflowStatus;
  createdAt?: string;
  updatedAt: string;
}

/**
 * Local Photo Evidence
 * Stores captured photographs as Blobs locally in IndexedDB before upload
 */
export interface LocalPhoto {
  id: string;
  inspectionId: string;
  questionId?: string; // linked checklist question
  blob: Blob;
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number;
  caption?: string;
  latitude?: number | null;
  longitude?: number | null;
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
  payload?: any;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Downloaded Assignment
 * Stores authorized assignments from Supervisor so Inspector can open them offline
 */
export interface DownloadedAssignment {
  id: string; // assignment ID or inspection ID
  siteId: string;
  siteName: string;
  siteCode?: string;
  projectName: string;
  projectCode?: string;
  location?: string;
  supervisorName?: string;
  checklistType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  instructions?: string;
  inspectorId: string;
  organizationId: string;
  downloadedAt: string;
  isAvailableOffline: boolean;
  sections?: any[];
}

/**
 * Locally cached checklist template
 */
export interface LocalChecklistTemplate {
  id: string;
  templateCode: string;
  title: string;
  version: number;
  sections: any[];
  updatedAt: string;
}
