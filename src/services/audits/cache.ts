import { getDb, ensureDb } from '../db';
import { getDecrypted, putEncrypted } from '../db/secure';
import type { Audit } from '../../types';

const db = getDb();
async function ensure(){ await ensureDb(); }

export async function saveAudits(audits: Audit[]) {
  await ensure();
  // Encrypted at rest
  await putEncrypted('audits', 'all', { items: audits });
}

export async function getAudits(): Promise<Audit[] | undefined> {
  await ensure();
  // Try encrypted first, fallback to legacy plaintext structure
  const dec = await getDecrypted<{ items: Audit[] }>('audits', 'all');
  if (dec?.items) return dec.items;
  const legacy = await db.get<any>('audits', 'all');
  return legacy?.items as Audit[] | undefined;
}
