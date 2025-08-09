// Lightweight API helper to attach auth and centralize the base URL
export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

export type ApiOptions = RequestInit & { skipAuth?: boolean; timeoutMs?: number };

function joinUrl(base: string, path: string) {
  if (!path) return base;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aegis_token') : null;
  const headers = new Headers(options.headers || {});

  // Default JSON content-type when body is provided and no content-type was set
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth && token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 15000;
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(joinUrl(API_BASE, path), {
      ...options,
      headers,
      signal: controller.signal,
    });
    // Auto-logout on 401 so the app shows the Login screen
    if (response.status === 401 && typeof window !== 'undefined') {
      try { localStorage.removeItem('aegis_token'); } catch {}
    }
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function apiJson<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, options);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json') || contentType.includes('+json');
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    if (isJson) {
      try {
        const data = await res.json();
        msg = (data?.message as string) || msg;
      } catch {}
    }
    throw new Error(msg);
  }
  return isJson ? (await res.json() as T) : (await res.text() as unknown as T);
}
