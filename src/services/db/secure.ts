import { getDb, ensureDb } from './index';
import { encryptJson, decryptJson, type EncryptedPayload } from '../security/crypto';
import { logError } from '../obs/logger';

let passphrase: string | null = null;
let passphraseProvider: (() => Promise<string | null> | string | null) | null = null;

export function setPassphrase(p: string, opts?: { rememberForSession?: boolean }){
  passphrase = p;
  try {
    if (opts?.rememberForSession && typeof window !== 'undefined') {
      sessionStorage.setItem('aegis_passphrase', p);
    }
  } catch {}
}
// Allow callers (e.g., native wrapper) to provide a custom resolver (OS keychain, biometric, etc.)
export function setPassphraseProvider(fn: (() => Promise<string | null> | string | null) | null) {
  passphraseProvider = fn;
}
export function getPassphrase(): string {
  if (passphrase) return passphrase;
  // If user asked to remember for session, restore it
  try {
    if (typeof window !== 'undefined') {
      const sess = sessionStorage.getItem('aegis_passphrase');
      if (sess) {
        passphrase = sess;
        return passphrase;
      }
    }
  } catch {}
  // Derive from auth token for now (demo). In production, prompt user or use OS keystore.
  const token = typeof window !== 'undefined' ? localStorage.getItem('aegis_token') : null;
  passphrase = token || 'aegis_dev_fallback_key';
  return passphrase;
}

export async function getPassphraseAsync(): Promise<string> {
  if (passphrase) return passphrase;
  // Try provider first
  try {
    if (passphraseProvider) {
      const val = await Promise.resolve(passphraseProvider());
      if (val) {
        passphrase = val;
        return passphrase;
      }
    }
  } catch (e) {
    // Non-fatal: fall back to sync path
  }
  return getPassphrase();
}

const db = getDb();
async function ensure(){ await ensureDb(); }

// Store value encrypted under `{ id, enc }` in the same object store (no new schema needed)
export async function putEncrypted<T>(store: string, id: IDBValidKey, value: T): Promise<void> {
  await ensure();
  const enc = await encryptJson(value, getPassphrase());
  await db.put(store, { id, enc } as any);
}

export async function getDecrypted<T>(store: string, id: IDBValidKey): Promise<T | undefined> {
  await ensure();
  const row = await db.get<any>(store, id);
  if (!row) return undefined;
  if (row.enc) {
    try { return await decryptJson<T>(row.enc as EncryptedPayload, getPassphrase()); } 
    catch (e: any) { 
      void logError('secure-db', 'Decryption failed', { store, id, error: e?.message || String(e) }); 
      return undefined; 
    }
  }
  return undefined;
}

export function clearPassphrase(){
  // Always clear in-memory key on demand (e.g., logout)
  passphrase = null;
  try { if (typeof window !== 'undefined') sessionStorage.removeItem('aegis_passphrase'); } catch {}
}

// Optional helper to remove an encrypted record entirely
export async function removeEncrypted(store: string, id: IDBValidKey): Promise<void> {
  await ensure();
  await db.delete(store, id);
}
