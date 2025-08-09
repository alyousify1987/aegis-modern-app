import * as duckdb from '@duckdb/duckdb-wasm';
// Use Vite asset URL imports for offline bundling
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import duckdb_worker_eh from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import duckdb_wasm_mvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import duckdb_worker_mvp from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';

type Msg = { id: string; type: 'init'|'query'|'register'; payload?: any };
type Resp = { id: string; ok: boolean; data?: any; error?: string };

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

async function ensure(){
  if(conn) return;
  // Select manual bundles so assets are packaged and available offline
  const manualBundles: duckdb.DuckDBBundles = {
    mvp: {
      // Minimal (no exception handling)
      mainModule: duckdb_wasm_mvp,
      mainWorker: duckdb_worker_mvp,
    },
    eh: {
      // Exception-handling build (preferred on modern browsers)
      mainModule: duckdb_wasm_eh,
      mainWorker: duckdb_worker_eh,
      // pthreadWorker is optional; omit to run single-threaded in worker
    },
  };
  const bundle = await duckdb.selectBundle(manualBundles);
  const worker = await duckdb.createWorker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  conn = await db.connect();
}

async function handle(msg: Msg): Promise<Resp>{
  try{
    if(msg.type === 'init'){ await ensure(); return { id: msg.id, ok: true }; }
    if(msg.type === 'query'){
      await ensure();
      const result = await conn!.query(String(msg.payload?.sql || ''));
      const rows = result.toArray();
      return { id: msg.id, ok: true, data: rows };
    }
    if(msg.type === 'register'){
      await ensure();
      const { name, columns, rows } = msg.payload || {};
      const colDefs = (columns as string[]).map(c => `${c} VARCHAR`).join(', ');
      await conn!.query(`CREATE TABLE IF NOT EXISTS ${name} (${colDefs});`);
      for (const r of rows as any[][]) {
        const values = r.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(',');
        await conn!.query(`INSERT INTO ${name} VALUES (${values});`);
      }
      return { id: msg.id, ok: true };
    }
    return { id: msg.id, ok: false, error: 'unknown message' };
  } catch(e: any){
    return { id: msg.id, ok: false, error: e?.message || String(e) };
  }
}

self.onmessage = async (ev: MessageEvent<Msg>) => {
  const resp = await handle(ev.data);
  (self as any).postMessage(resp);
};

export {};
