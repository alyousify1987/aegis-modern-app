import { Idb, type IdbStoreSchema } from './idb';

// Centralized DB schema to avoid "object store not found" errors when
// different modules open the same DB with different store lists.
const DB_NAME = 'aegis_app';
// Bump version when adding new stores
const DB_VERSION = 2;

const STORES: IdbStoreSchema[] = [
  { name: 'analytics', keyPath: 'id' },
  { name: 'audits', keyPath: 'id' },
  { name: 'logs', keyPath: 'id' },
  { name: 'sync', keyPath: 'id' },
];

let db: Idb | null = null;
let inited = false;
let initPromise: Promise<void> | null = null;

export function getDb(): Idb {
  if (!db) db = new Idb(DB_NAME, DB_VERSION, STORES);
  return db;
}

export async function ensureDb(): Promise<void> {
  if (inited) return;
  if (!initPromise) initPromise = getDb().init();
  await initPromise;
  inited = true;
}
