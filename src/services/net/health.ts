// Simple online/offline watcher and optional API ping
import { apiFetch } from '../../utils/api';

// Ensure boolean default even if a polyfilled navigator lacks onLine
let online = (typeof navigator !== 'undefined' && typeof (navigator as any).onLine === 'boolean')
  ? (navigator as any).onLine as boolean
  : true;
const subs = new Set<() => void>();

function notify() { subs.forEach((fn) => { try { fn(); } catch {} }); }

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { online = true; notify(); });
  window.addEventListener('offline', () => { online = false; notify(); });
}

export function isOnline() { return online; }
export function onOnlineChange(cb: () => void) { subs.add(cb); return () => subs.delete(cb); }

export async function pingApi(path = '/health'): Promise<boolean> {
  try {
  const res = await apiFetch(path, { method: 'GET', timeoutMs: 4000, skipAuth: true });
    return res.ok;
  } catch {
    return false;
  }
}
