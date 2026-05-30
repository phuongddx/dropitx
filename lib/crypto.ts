/**
 * E2E Encryption utilities using Web Crypto API (AES-256-GCM).
 *
 * Flow:
 * 1. Generate a random key or derive one from a password
 * 2. Encrypt content before upload — ciphertext goes to server
 * 3. Key is stored in URL fragment (#key=...) — never sent to server
 * 4. On view, extract key from fragment and decrypt client-side
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 600_000;

/** Create a proper ArrayBuffer from Uint8Array (TS 5.x compat). */
function toBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as unknown as ArrayBuffer;
}

function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

/** Generate a random AES-256-GCM key. */
export async function generateRandomKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable so we can export for URL fragment
    ["encrypt", "decrypt"],
  );
}

/** Derive an AES-256-GCM key from a password using PBKDF2. */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder();
  const saltBytes = salt ?? randomBytes(SALT_LENGTH);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password) as unknown as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toBuffer(saltBytes) as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );

  return { key, salt: saltBytes };
}

/** Export a CryptoKey to a base64url string for URL fragment storage. */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64url(raw);
}

/** Import a base64url key string back to a CryptoKey. */
export async function importKey(base64url: string): Promise<CryptoKey> {
  const raw = base64urlToUint8Array(base64url);
  return crypto.subtle.importKey(
    "raw",
    toBuffer(raw) as unknown as BufferSource,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * Returns a compact string: base64url(iv + salt? + ciphertext + tag).
 * If salt is provided (password-derived), it's prepended after the IV.
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
  salt?: Uint8Array,
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = randomBytes(IV_LENGTH);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: toBuffer(iv) as unknown as BufferSource },
    key,
    encoder.encode(plaintext) as unknown as BufferSource,
  );

  const cipherBytes = new Uint8Array(ciphertext);

  // Pack: iv (12) + [salt (16)] + ciphertext+tag
  const totalLength = iv.length + (salt ? salt.length : 0) + cipherBytes.length;
  const packed = new Uint8Array(totalLength);
  let offset = 0;
  packed.set(iv, offset);
  offset += iv.length;
  if (salt) {
    packed.set(salt, offset);
    offset += salt.length;
  }
  packed.set(cipherBytes, offset);

  return uint8ArrayToBase64url(packed);
}

/**
 * Decrypt a string produced by `encrypt`.
 * Automatically detects salt (password-derived) vs no salt (random key).
 */
export async function decrypt(
  packed: string,
  key: CryptoKey,
): Promise<string> {
  const data = base64urlToUint8Array(packed);
  const iv = toBuffer(data.slice(0, IV_LENGTH));

  try {
    const ciphertext = toBuffer(data.slice(IV_LENGTH));
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Try treating bytes after IV as salt+ciphertext (password-derived)
    if (data.length > IV_LENGTH + SALT_LENGTH) {
      const ciphertext = toBuffer(data.slice(IV_LENGTH + SALT_LENGTH));
      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv as unknown as BufferSource },
        key,
        ciphertext as unknown as BufferSource,
      );
      return new TextDecoder().decode(decrypted);
    }
    throw new Error("Decryption failed — wrong key or corrupted data");
  }
}

/**
 * Decrypt with a password. Extracts salt from packed data, derives key, decrypts.
 */
export async function decryptWithPassword(
  packed: string,
  password: string,
): Promise<string> {
  const data = base64urlToUint8Array(packed);
  if (data.length <= IV_LENGTH + SALT_LENGTH) {
    throw new Error("Invalid encrypted data");
  }

  const iv = data.slice(0, IV_LENGTH);
  const salt = data.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const ciphertext = data.slice(IV_LENGTH + SALT_LENGTH);

  const { key } = await deriveKeyFromPassword(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: toBuffer(iv) as unknown as BufferSource },
    key,
    toBuffer(ciphertext) as unknown as BufferSource,
  );

  return new TextDecoder().decode(decrypted);
}

/** Set the encryption key in the URL fragment. */
export function setKeyInFragment(key: string, passwordMode = false): void {
  const prefix = passwordMode ? "pkey=" : "key=";
  window.location.hash = prefix + key;
}

/** Extract the encryption key from the URL fragment. Returns null if absent. */
export function getKeyFromFragment(): { key: string; isPassword: boolean } | null {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);

  const key = params.get("key");
  if (key) return { key, isPassword: false };

  const pkey = params.get("pkey");
  if (pkey) return { key: pkey, isPassword: true };

  return null;
}

/** Clear the key from URL fragment (for security after use). */
export function clearKeyFromFragment(): void {
  if (typeof window !== "undefined") {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

// --- Base64url helpers ---

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToUint8Array(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlToArrayBuffer(str: string): ArrayBuffer {
  return toBuffer(base64urlToUint8Array(str));
}
