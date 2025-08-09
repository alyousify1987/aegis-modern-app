// WebCrypto-based encryption helpers for AES-GCM with PBKDF2-derived key

export type EncryptedPayload = {
  v: 1;
  iv: string; // base64
  salt: string; // base64
  tagLength: number; // bits
  data: string; // base64 (ciphertext)
};

function b64(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin);
}

function fromB64(s: string): ArrayBuffer {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJson(obj: unknown, passphrase: string, tagLength = 128): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt.buffer);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength }, key, plaintext);
  return {
    v: 1,
    iv: b64(iv.buffer),
    salt: b64(salt.buffer),
    tagLength,
    data: b64(ciphertext)
  };
}

export async function decryptJson<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  const iv = new Uint8Array(fromB64(payload.iv));
  const salt = new Uint8Array(fromB64(payload.salt));
  const key = await deriveKey(passphrase, salt.buffer);
  const cipher = fromB64(payload.data);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: payload.tagLength }, key, cipher);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plaintext));
}
