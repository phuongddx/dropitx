"use client";

/**
 * Draft storage utility for persisting editor drafts in localStorage.
 * Supports namespaced keys, structured draft metadata, and cross-tab sync.
 */

export interface DraftMeta {
  content: string;
  savedAt: string; // ISO timestamp
  title?: string;
}

const DRAFT_PREFIX = "dropitx-draft";

function getStorageKey(namespace: string): string {
  return `${DRAFT_PREFIX}:${namespace}`;
}

/**
 * Save a draft to localStorage with metadata.
 */
export function saveDraft(namespace: string, content: string, title?: string): void {
  try {
    const draft: DraftMeta = {
      content,
      savedAt: new Date().toISOString(),
      title,
    };
    localStorage.setItem(getStorageKey(namespace), JSON.stringify(draft));
  } catch {
    // localStorage unavailable or full
  }
}

/**
 * Load a draft from localStorage.
 * Returns null if no draft exists or parsing fails.
 */
export function loadDraft(namespace: string): DraftMeta | null {
  try {
    const raw = localStorage.getItem(getStorageKey(namespace));
    if (!raw) return null;
    const draft: DraftMeta = JSON.parse(raw);
    if (!draft.content) return null;
    return draft;
  } catch {
    return null;
  }
}

/**
 * Remove a draft from localStorage.
 */
export function removeDraft(namespace: string): void {
  try {
    localStorage.removeItem(getStorageKey(namespace));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Check if a draft exists for the given namespace.
 */
export function hasDraft(namespace: string): boolean {
  try {
    const raw = localStorage.getItem(getStorageKey(namespace));
    if (!raw) return false;
    const draft: DraftMeta = JSON.parse(raw);
    return !!draft.content;
  } catch {
    return false;
  }
}

/**
 * List all draft namespaces stored in localStorage.
 */
export function listDrafts(): Array<{ namespace: string; meta: DraftMeta }> {
  const drafts: Array<{ namespace: string; meta: DraftMeta }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX + ":")) {
        const namespace = key.slice(DRAFT_PREFIX.length + 1);
        const meta = loadDraft(namespace);
        if (meta) drafts.push({ namespace, meta });
      }
    }
  } catch {
    // localStorage unavailable
  }
  return drafts;
}
