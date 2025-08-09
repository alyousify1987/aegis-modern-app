// Dynamic Dexie import to avoid hard runtime/type dependency if not installed
let DexieLib: any | null = null;
let dexieInstance: any | null = null;

async function ensureDexie(): Promise<void> {
  if (dexieInstance) return;
  if (!DexieLib) {
    try {
      DexieLib = (await import('dexie')).default;
    } catch {
      DexieLib = null;
    }
  }
  if (!DexieLib) throw new Error('Dexie is not available');
  const db = new DexieLib('aegis_app');
  // Define historical schema (v1) for upgrades from older DBs that lacked 'documents'
  db.version(1).stores({
    audits: 'id, createdAt',
    ncrs: 'id, auditId, severity, status, updatedAt',
    capas: 'id, ncrId, status, dueAt',
    logs: 'id, ts, level, source',
    sync: 'id, createdAt, path, method',
  });
  // Current schema (v2): adds 'documents' store
  db.version(2).stores({
    audits: 'id, createdAt',
    documents: 'id, type, owner, rev, updatedAt',
    ncrs: 'id, auditId, severity, status, updatedAt',
    capas: 'id, ncrId, status, dueAt',
    logs: 'id, ts, level, source',
    sync: 'id, createdAt, path, method',
  });
  dexieInstance = db;
}

export function getDexie(): any {
  if (!dexieInstance) {
    // Kick off async init but return placeholder; callers should await operations
    void ensureDexie();
  }
  return dexieInstance;
}

// Prefer this in components performing immediate DB operations to avoid race conditions
export async function getDexieAsync(): Promise<any> {
  await ensureDexie();
  return dexieInstance;
}

export async function seedIfEmpty(): Promise<void> {
  await ensureDexie();
  const d = getDexie();
  const count = await d.table('audits').count();
  if (count === 0) {
    await d.table('audits').add({ id: `seed_${Date.now()}`, title: 'Seed Audit', createdAt: Date.now() });
  }
}
