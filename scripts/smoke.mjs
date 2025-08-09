// Robust API smoke test with proxy bypass, timeout, node:http fallback, and auto-start server
import http from 'node:http';
import { spawn } from 'node:child_process';
function withTimeout(promise, ms, label) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return {
    signal: ctrl.signal,
    done: promise.finally(() => clearTimeout(t)),
  };
}

async function fetchJson(url, opts = {}) {
  // Try global fetch first
  const { signal, done } = withTimeout(fetch(url, { ...opts, signal: undefined }), 3000, 'fetch');
  try {
    const res = await done;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || res.statusText);
    return json;
  } catch (e) {
    // Fallback to node:http
    return new Promise((resolve, reject) => {
      try {
        const u = new URL(url);
        const isPost = (opts.method || 'GET').toUpperCase() === 'POST';
        const bodyStr = isPost ? JSON.stringify(opts.body || {}) : null;
        const req = http.request({
          hostname: u.hostname,
          port: u.port || 80,
          path: u.pathname + (u.search || ''),
          method: isPost ? 'POST' : 'GET',
          timeout: 3000,
          headers: {
            'Content-Type': 'application/json',
            ...(opts.headers || {}),
            ...(isPost ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
          },
        }, (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = data ? JSON.parse(data) : {};
              if (res.statusCode >= 200 && res.statusCode < 300) return resolve(json);
              return reject(new Error(json?.error || `HTTP ${res.statusCode}`));
            } catch (err) { return reject(err); }
          });
        });
        req.on('error', reject);
        if (isPost && bodyStr) req.write(bodyStr);
        req.end();
      } catch (err) { reject(err); }
    });
  }
}

function get(base, path, headers) { return fetchJson(`${base}${path}`, { headers }); }
function post(base, path, body, headers) { return fetchJson(`${base}${path}`, { method: 'POST', headers, body }); }

async function main(){
  // Avoid corporate proxy interference
  process.env.NO_PROXY = [process.env.NO_PROXY || '', 'localhost', '127.0.0.1'].filter(Boolean).join(',');
  const bases = [process.env.API_BASE || 'http://127.0.0.1:3001', 'http://localhost:3001'];
  let base;
  let lastErr;
  for(const b of bases){
    try {
      await get(b, '/health');
      base = b;
      break;
    } catch(e){ lastErr = e; }
  }

  // Auto-start server if not reachable
  let serverProc = null;
  if(!base){
    serverProc = spawn(process.execPath, ['server/simple-server.js'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    // optional: log minimal output
    serverProc.stdout.on('data', d => {
      const s = d.toString();
      if (s.toLowerCase().includes('running on')) {
        // hint only
      }
    });
    serverProc.stderr.on('data', d => {
      // ignore noisy logs
    });

    // wait up to 8s for health
    const startDeadline = Date.now() + 8000;
    while(Date.now() < startDeadline){
      for(const b of bases){
        try {
          await get(b, '/health');
          base = b;
          break;
        } catch(e){ lastErr = e; }
      }
      if(base) break;
      await new Promise(r => setTimeout(r, 300));
    }
    if(!base){
      try { serverProc.kill('SIGTERM'); } catch {}
      throw new Error(`Failed to start server: ${lastErr?.message || lastErr}`);
    }
  }
  const health = await get(base, '/health');
  console.log('HEALTH', health.status, 'BASE', base);
  const login = await post(base, '/api/auth/login', { email: 'admin@aegisaudit.com', password: 'admin123' });
  const token = login.token;
  if(!token) throw new Error('No token in login response');
  console.log('TOKEN', token?.length || 0);
  const auth = { Authorization: `Bearer ${token}` };
  const audits = await get(base, '/api/audits', auth);
  console.log('AUDITS', audits?.data?.length ?? 0);
  const one = await post(base, '/api/audits/one-click', { type: 'ISO 22000', department: 'Production' }, auth);
  console.log('ONECLICK', one.auditId);
  const analytics = await get(base, '/api/analytics', auth);
  console.log('ANALYTICS', analytics?.data?.totalAudits ?? 0);

  // graceful shutdown if we started the server
  if (serverProc && !serverProc.killed) {
    serverProc.kill('SIGTERM');
  }
}

main().catch(e => { 
  console.error('SMOKE ERROR', e.message);
  if(e?.stack) console.error(e.stack);
  if(e?.cause) console.error('CAUSE', e.cause);
  process.exit(1);
});
