/**
 * Browser-side authenticated encryption primitives. Not connected to live letters.
 * Key distribution, recovery setup, and migration must precede production use.
 */
export type EncryptedEnvelope = {
  version: 1;
  algorithm: 'AES-256-GCM';
  iv: string;
  ciphertext: string;
};

const MAX_BYTES = 64 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function cryptoApi(): Crypto {
  if (!globalThis.crypto?.subtle) throw new Error('Secure browser cryptography is unavailable');
  return globalThis.crypto;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index++) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(value: unknown, maxBytes: number) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value) ||
      value.length > Math.ceil(maxBytes * 4 / 3)) throw new Error('Invalid encoded data');
  const bytes = Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
  if (bytes.length > maxBytes || encode(bytes) !== value) throw new Error('Invalid encoded data');
  return bytes;
}

function associatedData(context: string) {
  if (typeof context !== 'string' || !context || context.length > 2048) throw new Error('Invalid encryption context');
  // Caller supplies the expected record identity, never a value trusted from ciphertext.
  return encoder.encode(JSON.stringify(['SEALED', 1, 'AES-256-GCM', context]));
}

function checkKey(key: CryptoKey): void {
  if (key.type !== 'secret' || key.algorithm.name !== 'AES-GCM' ||
      (key.algorithm as AesKeyAlgorithm).length !== 256) throw new Error('An AES-256-GCM key is required');
}

/** Memory-only key. Key distribution/wrapping is intentionally not implemented here. */
export function generateEncryptionKey(): Promise<CryptoKey> {
  return cryptoApi().subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/** Recovery codes are secrets. Never send them to the API, logs, analytics, or URLs. */
export async function generateRecoveryCode(): Promise<string> {
  return `SEALED-R1-${encode(cryptoApi().getRandomValues(new Uint8Array(32)))}`;
}

/** Import the random recovery secret for encrypting a future private-key backup. */
export async function importRecoveryCode(code: string): Promise<CryptoKey> {
  if (typeof code !== 'string' || !code.startsWith('SEALED-R1-')) throw new Error('Invalid recovery code');
  const bytes = decode(code.slice('SEALED-R1-'.length), 32);
  if (bytes.length !== 32) throw new Error('Invalid recovery code');
  try {
    return await cryptoApi().subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
  } finally {
    bytes.fill(0);
  }
}

export async function encryptText(key: CryptoKey, text: string, context: string): Promise<EncryptedEnvelope> {
  checkKey(key);
  if (typeof text !== 'string') throw new Error('Plaintext must be a string');
  const bytes = encoder.encode(text);
  if (bytes.length > MAX_BYTES) throw new Error('Plaintext is too large');
  const iv = cryptoApi().getRandomValues(new Uint8Array(12));
  try {
    const encrypted = await cryptoApi().subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: associatedData(context), tagLength: 128 }, key, bytes
    );
    return { version: 1, algorithm: 'AES-256-GCM', iv: encode(iv), ciphertext: encode(new Uint8Array(encrypted)) };
  } finally {
    bytes.fill(0);
  }
}

export async function decryptText(key: CryptoKey, envelope: EncryptedEnvelope, context: string): Promise<string> {
  checkKey(key);
  if (!envelope || envelope.version !== 1 || envelope.algorithm !== 'AES-256-GCM') throw new Error('Unsupported encrypted envelope');
  const iv = decode(envelope.iv, 12);
  const ciphertext = decode(envelope.ciphertext, MAX_BYTES + 16);
  if (iv.length !== 12 || ciphertext.length < 16) throw new Error('Invalid encrypted envelope');
  const plaintext = new Uint8Array(await cryptoApi().subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: associatedData(context), tagLength: 128 }, key, ciphertext
  ));
  try { return decoder.decode(plaintext); } finally { plaintext.fill(0); }
}
