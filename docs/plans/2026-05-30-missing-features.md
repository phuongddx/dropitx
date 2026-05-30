# DropItX — 8 Missing Features Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implement 8 competitive features to match/exceed Pastebin, PrivateBin, and Gist.

**Architecture:** Client-side encryption + server-side metadata. Supabase Postgres for storage, Supabase Storage for files.

**Tech Stack:** Next.js 16, React 19, Web Crypto API, FastAPI, Supabase

---

## Agent 1: Security & Lifecycle (E2E + Expiration + Burn + Versioning)

### Feature 1: End-to-End Encryption

**What:** Client-side AES-256-GCM encryption. Server never sees plaintext. Encryption key in URL fragment (#).

**Backend Tasks:**
1. Add `encrypted` boolean column to shares table (Supabase migration)
2. Add `encryption_iv` and `encryption_salt` columns (stored with share, not secret)
3. Update ShareCreate model to accept `encrypted: bool`
4. Store encrypted content as base64 in storage
5. Return share metadata without content (content decrypted client-side)

**Frontend Tasks:**
1. Create `lib/crypto.ts` with Web Crypto API helpers:
   - `generateKey(password?)` → CryptoKey
   - `encrypt(plaintext, key)` → {ciphertext, iv, salt}
   - `decrypt(ciphertext, key, iv, salt)` → plaintext
   - Key derived from password or random, stored in URL fragment
2. Update editor to encrypt before upload
3. Update share viewer to decrypt from URL fragment key
4. Add E2E toggle in share settings UI

**Database Migration:**
```sql
ALTER TABLE shares ADD COLUMN encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE shares ADD COLUMN encryption_iv TEXT;
ALTER TABLE shares ADD COLUMN encryption_salt TEXT;
```

---

### Feature 2: Expiration / Auto-Delete

**What:** Configurable share expiration: 5min, 10min, 1hr, 6hr, 12hr, 1day, 1week, 1month, forever.

**Backend Tasks:**
1. Add `expires_at` column to shares (already exists in model!)
2. Add Supabase cron/trigger to delete expired shares
3. Create cleanup endpoint or Supabase Edge Function
4. Update share fetch to check expiration before serving

**Frontend Tasks:**
1. Add expiration selector in share settings (dropdown)
2. Show countdown/expiry badge on share page
3. Show "This share has expired" page for expired links

**Database Migration:**
```sql
-- expires_at already exists, just need cleanup function
CREATE OR REPLACE FUNCTION delete_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM shares WHERE expires_at < NOW() AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run every minute via pg_cron
SELECT cron.schedule('delete-expired', '* * * * *', 'SELECT delete_expired_shares()');
```

---

### Feature 3: Burn After Reading

**What:** Share self-destructs after first view. Perfect for secrets/passwords.

**Backend Tasks:**
1. Add `burn_after_reading` boolean column to shares
2. In share view endpoint: if burn=true, delete share after serving content
3. Return content + delete in same request (atomic)

**Frontend Tasks:**
1. Add "Burn after reading" toggle in share settings
2. Show warning banner on burn-enabled shares
3. Show "This message has been burned" page after viewing

**Database Migration:**
```sql
ALTER TABLE shares ADD COLUMN burn_after_reading BOOLEAN DEFAULT FALSE;
```

---

### Feature 4: Version History

**What:** Track revisions when share content is updated.

**Backend Tasks:**
1. Create `share_revisions` table
2. On content update: save current version to revisions before overwriting
3. Add revision list endpoint: GET /shares/{slug}/revisions
4. Add restore endpoint: POST /shares/{slug}/revisions/{rev_id}/restore

**Frontend Tasks:**
1. Add revision history panel in editor
2. Show diff between versions
3. Allow restoring previous versions

**Database Migration:**
```sql
CREATE TABLE share_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_share_revisions_share ON share_revisions(share_id, revision_number DESC);
```

---

## Agent 2: Collaboration & UX (Multi-file + Comments + QR + Drafts)

### Feature 5: Multi-File Support

**What:** Multiple files per share, like GitHub Gist.

**Backend Tasks:**
1. Create `share_files` table for multi-file shares
2. Update upload endpoint to accept multiple files
3. Update share fetch to return all files
4. Maintain backward compatibility with single-file shares

**Frontend Tasks:**
1. Update upload dropzone for multi-file
2. Add file tabs in editor/viewer
3. Add file list sidebar

**Database Migration:**
```sql
CREATE TABLE share_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  storage_path TEXT,
  mime_type TEXT,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_share_files_share ON share_files(share_id, sort_order);
```

---

### Feature 6: Comments / Discussion

**What:** Comment threads on shared content.

**Backend Tasks:**
1. Create `share_comments` table
2. Add CRUD endpoints for comments
3. Add nested replies support (parent_id)

**Frontend Tasks:**
1. Add comment section below share viewer
2. Add reply UI
3. Add comment count badge

**Database Migration:**
```sql
CREATE TABLE share_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  user_id UUID,
  parent_id UUID REFERENCES share_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_share_comments_share ON share_comments(share_id, created_at);
```

---

### Feature 7: QR Code Generation

**What:** Auto-generate QR code for any share URL.

**Backend Tasks:**
1. Add QR generation endpoint: GET /shares/{slug}/qr
2. Use `qrcode` Python library to generate PNG/SVG
3. Cache QR images

**Frontend Tasks:**
1. Add QR code button in share page
2. Show QR in modal/dialog
3. Add download QR as PNG

---

### Feature 8: Draft Autosave

**What:** Auto-save editor content to localStorage while editing.

**Frontend Tasks:**
1. Create `lib/draft-storage.ts` with localStorage CRUD
2. Add autosave hook with debounce (2s)
3. Show "Draft saved" indicator
4. Restore draft on page load
5. Clear draft after successful publish

---

## Execution Split

**Agent 1** handles: Features 1-4 (Security & Lifecycle)
- Backend: migrations, endpoints, models
- Frontend: encryption UI, expiration UI, burn UI, version history UI

**Agent 2** handles: Features 5-8 (Collaboration & UX)
- Backend: multi-file endpoints, comments endpoints, QR endpoint
- Frontend: multi-file editor, comments UI, QR modal, draft autosave
