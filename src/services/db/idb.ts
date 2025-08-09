// Minimal IndexedDB wrapper (no framework dependency)
// Provides a simple key-value store and object store helpers.

export type IdbStoreSchema = {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: Array<{ name: string; keyPath: string | string[]; options?: IDBIndexParameters }>
};

export class Idb {
  private db?: IDBDatabase;
  constructor(private name: string, private version: number, private stores: IdbStoreSchema[]) {}

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      request.onupgradeneeded = () => {
        const db = request.result;
        this.stores.forEach(s => {
          if (!db.objectStoreNames.contains(s.name)) {
            const store = db.createObjectStore(s.name, { keyPath: s.keyPath, autoIncrement: s.autoIncrement });
            s.indexes?.forEach(idx => store.createIndex(idx.name, idx.keyPath, idx.options));
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private getStore(name: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('DB not initialized');
    const tx = this.db.transaction(name, mode);
    return tx.objectStore(name);
  }

  async put<T>(store: string, value: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(store, 'readwrite').put(value as any);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async get<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(store, 'readonly').get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll<T>(store: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(store, 'readonly').getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(store: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(store, 'readwrite').delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
