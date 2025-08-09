// Tiny typed event bus to decouple modules (audits, risks, actions, etc.)

export type EventMap = {
  'audit:created': { id: string; standard?: string; scope?: string };
  'audit:deleted': { id: string };
  'finding:created': { id: string; auditId: string; severity: string };
  'ncr:created': { id: string; sourceFindingId?: string };
  'risk:updated': { id: string; score: number };
};

export type EventKey = keyof EventMap;
export type EventHandler<K extends EventKey> = (payload: EventMap[K]) => void;

class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<K extends EventKey>(event: K, handler: EventHandler<K>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler as any);
    this.listeners.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends EventKey>(event: K, handler: EventHandler<K>) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler as any);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { (fn as EventHandler<K>)(payload); } catch { /* no-op */ }
    }
  }
}

export const eventBus = new EventBus();
