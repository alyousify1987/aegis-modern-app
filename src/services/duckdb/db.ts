// DuckDB-WASM service with queued init and shared connection
// Framework-agnostic; consumers can call query() once ready.

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
import { logError } from '../obs/logger';

function uid(){ return `${Date.now()}-${Math.random()}`; }

function call<T>(type: 'init'|'query'|'register', payload?: any): Promise<T> {
  if(!worker) throw new Error('DuckDB worker not started');
  const id = uid();
  return new Promise<T>((resolve, reject) => {
    const onMsg = (ev: MessageEvent<any>) => {
      const data = ev.data;
      if(!data || data.id !== id) return;
      worker!.removeEventListener('message', onMsg as any);
      if(data.ok) resolve(data.data as T);
      else {
        const err = new Error(data.error || 'DuckDB error');
        void logError('duckdb-call', `DuckDB ${type} failed`, { error: data.error, payloadHint: type === 'query' ? String(payload?.sql||'')?.slice(0,200) : undefined });
        reject(err);
      }
    };
    worker!.addEventListener('message', onMsg as any);
    worker!.postMessage({ id, type, payload });
  });
}

export async function initDuckDB(): Promise<void> {
  if(ready) return ready;
  ready = (async () => {
    // Use Vite worker URL resolution
    // @ts-ignore
    worker = new Worker(new URL('./duck.worker.ts', import.meta.url), { type: 'module' });
    // Surface worker-level failures in Diagnostics logs
    worker.addEventListener('error', (e: any) => {
      void logError('duckdb-worker', e?.message || 'Worker error', { error: e?.error?.stack || String(e?.error || e) });
    });
    worker.addEventListener('messageerror', (e: any) => {
      void logError('duckdb-worker', 'Message deserialization error', { data: String(e?.data || '') });
    });
    await call('init');
  })();
  return ready;
}

export async function query<T = unknown>(sql: string): Promise<T[]> {
  if (!ready) await initDuckDB();
  await ready;
  return call<T[]>('query', { sql });
}

export async function registerTable(name: string, columns: string[], rows: any[][]) {
  if (!ready) await initDuckDB();
  await ready;
  await call('register', { name, columns, rows });
}
