import { getDb, ensureDb } from '../db';

const db = getDb();
async function ensure(){ await ensureDb(); }

export async function logError(source: string, message: string, meta?: any){
  try {
    await ensure();
    await db.put('logs', { id: `${Date.now()}-${Math.random()}`, level: 'error', source, message, meta, ts: Date.now() } as any);
  } catch {}
  console.error(`[${source}]`, message, meta);
}

export async function logInfo(source: string, message: string, meta?: any){
  try {
    await ensure();
    await db.put('logs', { id: `${Date.now()}-${Math.random()}`, level: 'info', source, message, meta, ts: Date.now() } as any);
  } catch {}
  console.log(`[${source}]`, message, meta);
}

export async function getLogs(limit = 200){
  await ensure();
  const rows = await db.getAll<any>('logs');
  return rows.slice(-limit);
}
