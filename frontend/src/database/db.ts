import Dexie, { type EntityTable } from 'dexie';
import type { LocalInspection, LocalPhoto, SyncQueueItem } from './schema';

/**
 * NirikshanLocalDB
 * Browser-side IndexedDB database powered by Dexie.js
 * Versioned schema for offline inspection storage, local photos, and sync queue
 */
export class NirikshanLocalDB extends Dexie {
  inspections!: EntityTable<LocalInspection, 'id'>;
  photos!: EntityTable<LocalPhoto, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('NirikshanLocalDB');

    // Schema version 1
    // Syntax: '&' = primary key, indexable fields listed after comma
    this.version(1).stores({
      inspections: '&id, assignmentId, siteId, syncStatus, updatedAt',
      photos: '&id, inspectionId, syncStatus, createdAt',
      syncQueue: '&id, entityId, entityType, status, createdAt',
    });
  }
}

// Singleton database instance
export const db = new NirikshanLocalDB();
