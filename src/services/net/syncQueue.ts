import { getDb, ensureDb } from '../db';
import { isOnline, onOnlineChange } from './health';
import { apiFetch } from '../../utils/api';

export type SyncTask = {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: any;
  headers?: Record<string, string>;
  attempts?: number;
  createdAt: number;
};

const db = getDb();
let inited = false;
let processing = false;
let currentPromise: Promise<void> | null = null;
const queueSubs = new Set<() => void>();

function notifyQueue() { queueSubs.forEach(cb => { try { cb(); } catch {} }); }

export function onQueueChange(cb: () => void) { queueSubs.add(cb); return () => queueSubs.delete(cb); }
export function isProcessingQueue() { return processing; }

async function ensure(){ if(!inited){ await ensureDb(); inited = true; } }

export async function enqueue(task: Omit<SyncTask,'id'|'attempts'|'createdAt'>){
  await ensure();
  // Simple dedupe: if an identical method+path+body exists, skip adding another
  const existing = (await getAllTasks()).find(t => t.method === task.method && t.path === task.path && JSON.stringify(t.body ?? null) === JSON.stringify(task.body ?? null));
  if(existing) return;
  const id = `${Date.now()}-${Math.random()}`;
  const full: SyncTask = { id, attempts: 0, createdAt: Date.now(), ...task };
  await db.put('sync', full as any);
}

async function getAllTasks(): Promise<SyncTask[]>{
  await ensure();
  return db.getAll<SyncTask>('sync');
}

async function removeTask(id: string){
  await ensure();
  await db.delete('sync', id as any);
}

function sleep(ms: number){ return new Promise(r => setTimeout(r, ms)); }

export async function processQueue(): Promise<void> {
  if (processing) {
    // If already processing, return the inflight promise so callers can await completion
    return currentPromise ?? Promise.resolve();
  }
  processing = true;
  notifyQueue();
  currentPromise = (async () => {
    try{
      if(!isOnline()) return;
      const tasks = await getAllTasks();
      for(const t of tasks){
        const attempt = t.attempts || 0;
        const base = Math.min(1000 * Math.pow(2, attempt), 30000);
        const jitter = Math.floor(Math.random() * 300);
        const backoff = base + jitter;
        await sleep(backoff);
        try{
          const res = await apiFetch(t.path, { method: t.method, body: t.body ? JSON.stringify(t.body) : undefined, headers: t.headers});
          if(res.ok){ await removeTask(t.id); }
          else {
            const next = attempt + 1;
            if(next >= 8) { await removeTask(t.id); } else { await db.put('sync', { ...t, attempts: next } as any); }
          }
        } catch{
          const next = (t.attempts||0) + 1;
          if(next >= 8) { await removeTask(t.id); } else { await db.put('sync', { ...t, attempts: next } as any); }
        }
        if(!isOnline()) break;
      }
    } finally {
      processing = false;
      currentPromise = null;
      notifyQueue();
    }
  })();
  return currentPromise;
}

onOnlineChange(() => { if(isOnline()) void processQueue(); });

export async function listTasks(){
  return getAllTasks();
}

export async function clearAll(){
  const tasks = await getAllTasks();
  for(const t of tasks){ await removeTask(t.id); }
}

export async function deleteTask(id: string){
  await removeTask(id);
}

export async function retryTask(id: string){
  await ensure();
  const tasks = await getAllTasks();
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  // Reset attempts and try once immediately if online, else keep with attempts=0
  const fresh = { ...t, attempts: 0 } as SyncTask;
  await db.put('sync', fresh as any);
  if(isOnline() && !processing){
    // Process just this task with same logic
    try{
      const res = await apiFetch(fresh.path, { method: fresh.method, body: fresh.body ? JSON.stringify(fresh.body) : undefined, headers: fresh.headers});
      if(res.ok){ await removeTask(fresh.id); }
    } catch{
      // leave in queue for global processor
    }
  }
}
