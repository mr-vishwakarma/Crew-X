import Dexie, { type EntityTable } from 'dexie';
import type {
  LocalInspection,
  LocalPhoto,
  SyncQueueItem,
  DownloadedAssignment,
  LocalChecklistTemplate,
} from './schema';

/**
 * NirikshanLocalDB
 * Browser-side IndexedDB database powered by Dexie.js
 * Versioned schema for offline inspection storage, local photos, downloaded assignments, and sync queue
 */
export class NirikshanLocalDB extends Dexie {
  inspections!: EntityTable<LocalInspection, 'id'>;
  photos!: EntityTable<LocalPhoto, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  downloadedAssignments!: EntityTable<DownloadedAssignment, 'id'>;
  checklistTemplates!: EntityTable<LocalChecklistTemplate, 'id'>;

  constructor() {
    super('NirikshanLocalDB');

    // Schema version 1 (original foundation)
    this.version(1).stores({
      inspections: '&id, assignmentId, siteId, syncStatus, updatedAt',
      photos: '&id, inspectionId, syncStatus, createdAt',
      syncQueue: '&id, entityId, entityType, status, createdAt',
    });

    // Schema version 2 (multi-tenant scoping & downloaded assignments)
    this.version(2).stores({
      inspections: '&id, assignmentId, siteId, inspectorId, organizationId, syncStatus, updatedAt',
      photos: '&id, inspectionId, syncStatus, createdAt',
      syncQueue: '&id, entityId, entityType, status, createdAt',
      downloadedAssignments: '&id, siteId, inspectorId, organizationId, downloadedAt',
    });

    // Schema version 3 (checklist templates & photo question links)
    this.version(3).stores({
      inspections: '&id, assignmentId, siteId, inspectorId, organizationId, syncStatus, updatedAt',
      photos: '&id, inspectionId, questionId, syncStatus, createdAt',
      syncQueue: '&id, entityId, entityType, status, createdAt',
      downloadedAssignments: '&id, siteId, inspectorId, organizationId, downloadedAt',
      checklistTemplates: '&id, templateCode, version, updatedAt',
    });
  }
}

// Singleton database instance
export const db = new NirikshanLocalDB();
