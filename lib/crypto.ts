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
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
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
  return uint8ToBase64url(new Uint8Array(raw));
}

/** Import a base64url key string back to a CryptoKey. */
export async function importKey(base64url: string): Promise<CryptoKey> {
  const raw = base64urlToUint8(base64url);
  return crypto.subtle.importKey(
    "raw",
    raw,
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
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );

  // Pack: iv (12) + [salt (16)] + ciphertext+tag
  const parts: Uint8Array[] = [iv];
  if (salt) parts.push(salt);
  parts.push(new Uint8Array(ciphertext));

  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const packed = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    packed.set(part, offset);
    offset += part.length;
  }

  return uint8ToBase64url(packed);
}

/**
 * Decrypt a string produced by `encrypt`.
 * Automatically detects salt (password-derived) vs no salt (random key).
 * With salt: first 12 bytes = IV, next 16 = salt, rest = ciphertext+tag.
 * Without salt: first 12 bytes = IV, rest = ciphertext+tag.
 * We use the presence of salt in the packed data to distinguish.
 *
 * For password-derived keys, pass the password and the function will
 * extract the salt and re-derive the key.
 */
export async function decrypt(
  packed: string,
  key: CryptoKey,
): Promise<string> {
  const data = base64urlToUint8(packed);
  const iv = data.slice(0, IV_LENGTH);

  // AES-256-GCM ciphertext always has a 16-byte auth tag appended.
  // For a ~0 byte plaintext, ciphertext+tag = 16 bytes.
  // With salt (16 bytes), min data size = 12 + 16 + 16 = 44.
  // Without salt, min data size = 12 + 16 = 28.
  // We'll try without salt first (more common for random key).
  // If that fails and data is long enough, try with salt.

  try {
    const ciphertext = data.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Try treating bytes after IV as salt+ciphertext (password-derived)
    // This path is hit when the key was derived from password and salt is embedded
    if (data.length > IV_LENGTH + SALT_LENGTH) {
      const salt = data.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
      const ciphertext = data.slice(IV_LENGTH + SALT_LENGTH);
      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        key,
        ciphertext,
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
  const data = base64urlToUint8(packed);
  if (data.length <= IV_LENGTH + SALT_LENGTH) {
    throw new Error("Invalid encrypted data");
  }

  const iv = data.slice(0, IV_LENGTH);
  const salt = data.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const ciphertext = data.slice(IV_LENGTH + SALT_LENGTH);

  const { key } = await deriveKeyFromPassword(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
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

function uint8ToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToUint8(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
