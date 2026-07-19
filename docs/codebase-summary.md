# DropItX - Codebase Summary

## Project Overview

**DropItX** is a Next.js 16 frontend for secure file sharing with inline editing, advanced privacy controls, and team collaboration. Upload HTML and Markdown files, write with an integrated CodeMirror 6 editor, generate short shareable links with optional passwords, and manage content programmatically via REST API or CLI. Supports end-to-end encryption, burn-after-reading, version history, comments, QR code sharing, and analytics.

**Status**: v1.4.1 (2026-04-26) — Production ready with comprehensive feature set.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript 5 (strict) |
| **Editor** | CodeMirror 6 + markdown extensions (loaded via `next/dynamic` with SSR disabled) |
| **Viewer** | `react-markdown` + `remark-gfm` + Shiki syntax highlighting |
| **Styling** | Tailwind CSS 4 + shadcn/ui + Clay design system (light-first, warm cream, terracotta accent) |
| **Database** | Supabase PostgreSQL with Row-Level Security (RLS), S3-compatible Storage |
| **Auth** | Supabase Auth (Google OAuth, GitHub OAuth, email/password with PKCE) |
| **Backend API** | FastAPI (Python) on Render — all business logic except OG image generation |
| **File Upload** | `react-dropzone` (≤ 50 MB files) |
| **Theme** | `next-themes` (light/dark mode) |
| **Analytics** | Vercel Analytics + custom `analytics_events` table |
| **Rate Limiting** | Upstash Redis (10 req/min IP-based) |
| **CLI** | `packages/cli/` — TypeScript ESM, binary `dropitx` |
| **Encryption** | Web Crypto API (AES-256-GCM, client-side) |

## Directory Structure

```
app/                           # Next.js App Router (routes + layouts)
├── (public)/                  # Public routes (landing, editor, shares, auth)
│   ├── page.tsx              # Landing page (HeroSection + ProofCards + WorkflowSteps + CTA)
│   ├── editor/page.tsx       # Markdown editor with live preview
│   ├── s/[slug]/page.tsx     # Share viewer (handles .html/.md/.encrypted)
│   ├── embed/[slug]/page.tsx # oEmbed viewer
│   ├── search/page.tsx       # Full-text search results
│   ├── auth/login/page.tsx   # Email/password + OAuth login
│   ├── auth/reset-password/page.tsx
│   ├── auth/update-password/page.tsx
│   ├── auth/callback/route.ts # PKCE code exchange
│   ├── auth/confirm/route.ts  # Email confirmation
│   └── invite/accept/page.tsx # Team invite acceptance
├── (dashboard)/              # Protected dashboard routes (redirect unauthenticated)
│   ├── dashboard/page.tsx    # Share list + stats
│   ├── dashboard/profile/page.tsx
│   ├── dashboard/favorites/page.tsx
│   ├── dashboard/analytics/page.tsx
│   ├── dashboard/analytics/[slug]/page.tsx
│   ├── dashboard/teams/page.tsx
│   ├── dashboard/teams/new/page.tsx
│   ├── dashboard/teams/[slug]/page.tsx
│   ├── dashboard/teams/[slug]/members/page.tsx
│   └── dashboard/teams/[slug]/settings/page.tsx
├── api/
│   └── og-image/[slug]/route.tsx   # OG image generation (only Next.js API route)
├── layout.tsx, error.tsx, not-found.tsx, loading.tsx
├── globals.css, markdown-viewer.css, favicon.ico
└── [root middleware in middleware.ts for auth redirect]

components/                    # React components (composable, feature-organized)
├── ui/                        # Primitives: button, card, input, dialog, select, etc.
├── [Feature areas]/
│   ├── editor-*.tsx          # Editor components (pane, preview, toolbar, publish-bar)
│   ├── share-*.tsx           # Share components (password-gate, link, analytics-tracker)
│   ├── encryption-*.tsx      # Encryption UI (toggle, viewer)
│   ├── burn-*.tsx            # Burn-after-reading (toggle, tracker, warning, state)
│   ├── expiration-*.tsx      # Expiration select + badge + state
│   ├── comments-section.tsx  # Comments/discussion
│   ├── version-history.tsx   # Version history viewer
│   ├── file-*.tsx            # Multi-file support (tabs, list-sidebar, multi-file-upload)
│   ├── qr-code-button.tsx    # QR code modal
│   ├── upload-*.tsx          # Upload (dropzone, progress)
│   ├── markdown-viewer.tsx, html-viewer.tsx
│   ├── search-*.tsx          # Search (bar, results)
│   ├── dashboard-*.tsx       # Dashboard (sidebar-nav, mobile-nav, toolbar, share-card, share-list)
│   ├── analytics/*.tsx       # Analytics (stats-cards, view-chart, geo-chart, top-performers)
│   ├── auth-*.tsx, password-*.tsx # Auth + password
│   ├── team-*.tsx            # Team features (nav, member-row, invite-form, activity-feed)
│   ├── invite-*.tsx          # Invite system (dialog, bulk, accept-form, notification-bell)
│   ├── header-*.tsx          # Header (bar, nav, mobile-drawer)
│   ├── landing-*.tsx, hero-*.tsx, proof-cards.tsx, workflow-steps.tsx, cta-section.tsx
│   └── theme-provider.tsx, vercel-analytics.tsx

lib/                           # Utilities and helpers
├── api-client.ts            # authFetch() + JWT Bearer + 401 retry for FastAPI
├── crypto.ts                # Web Crypto API (AES-256-GCM encrypt/decrypt, key generation)
├── draft-storage.ts         # localStorage draft persistence (autosave)
├── file-utils.ts            # File handling (multi-file logic)
├── share-access-cookie.ts   # Password access cookie (HMAC-SHA256)
├── analytics-track.ts, analytics.ts
├── team-rpc.ts, team-utils.ts, team-event-utils.ts
├── token-security.ts        # Invite token generation/validation
├── use-auth-user.ts         # Custom hook for current user
├── use-auto-save.ts, use-editor-auto-save.ts
├── editor-extensions/       # CodeMirror extensions (slash-commands, image-drop, image-preview)
├── api-utils.ts, api-key.ts
├── oembed-utils.ts, referrer-parser.ts
├── password.ts, nanoid.ts, slugify-handle.ts, validation.ts
├── nav-links.ts, shiki-highlighter.ts
└── use-scroll-sync.ts, invite-utils.ts

hooks/                        # Custom React hooks
├── use-auth-user.ts
├── use-email-validation.ts
├── use-team.ts
└── use-toast.ts

utils/supabase/              # Supabase client factories
├── client.ts               # Browser client (with middleware auth)
├── server.ts               # Server client (SSR-disabled, uses createClient)
└── middleware.ts           # Auth middleware (refresh & session management)

types/                        # TypeScript interfaces
├── share.ts, team.ts, team-event.ts, analytics.ts

packages/cli/                # Standalone CLI tool
├── src/index.ts            # Binary entry: dropitx
├── src/commands/
│   ├── login.ts
│   ├── publish.ts
│   ├── update.ts
│   ├── delete.ts
│   ├── list.ts
│   └── whoami.ts

supabase/                     # Database schema + migrations
├── schema.sql               # Base schema (shares, user_profiles, favorites)
├── migrations/
│   ├── 20260423000001_add_auth_tables.sql
│   ├── 20260424000001_add_editor_columns.sql
│   ├── 20260424000002_add_api_keys.sql
│   ├── 20260424000003_private_search_filter.sql
│   ├── 20260425000001_add_share_password.sql
│   ├── 20260425045621_rate-limits-supabase.sql
│   ├── 20260426000001_share_views.sql
│   ├── 20260426000002_teams.sql
│   ├── 20260428000001-000005_fix_team_rls_issues.sql
│   ├── 20260429_team_lifecycle_redesign.sql
│   ├── 20260429180000_decline_team_invite.sql
│   └── 20260430121500_fix_ambiguous_team_id_in_invite_policies.sql
└── config.toml

docs/                         # Documentation
├── project-overview-pdr.md
├── system-architecture.md
├── codebase-summary.md
├── code-standards.md
├── deployment-guide.md
├── design-guidelines.md
├── project-roadmap.md
└── project-changelog.md

public/                       # Static assets (favicon, icons, images)
.env.example, next.config.ts, tsconfig.json, tailwind.config.ts, package.json
```

## Core Features

### File Sharing
- **Upload**: Drag-drop HTML/Markdown (up to 50 MB per file)
- **Share Links**: Short nanoid slugs (`/s/abc123`)
- **Custom Slugs**: Optional vanity URLs (`handle/my-doc`)
- **Auto-expire**: Default 30-day expiration (customizable via expiration-select)
- **Delete Token**: Anonymous deletion for file-upload shares

### Editor & Markdown
- **In-Browser Editor**: CodeMirror 6 with Markdown support
- **Live Preview**: React-markdown + Shiki syntax highlighting
- **Slash Commands**: `/image`, `/heading`, `/code`, `/link`, `/list` etc.
- **Image Drag-Drop**: Inline preview + upload to Storage
- **Auto-Draft**: localStorage persistence with dirty-state warning
- **Editor Publish**: Title, custom slug, privacy toggle

### Privacy & Security
- **Password Protection**: bcryptjs hash (never sent to client)
- **Share Access Cookie**: HMAC-SHA256 signed HttpOnly (24 h TTL)
- **End-to-End Encryption**: AES-256-GCM client-side (Web Crypto API), key in URL fragment
  - **Crypto utilities**: `lib/crypto.ts` provides symmetric encryption/decryption with Uint8Array support
  - **Encryption UI**: Toggle in editor/share flow; encrypted shares use `EncryptedContentViewer`
  - **Secure key exchange**: Encryption key never touches server, shared via URL fragment only
- **Burn-After-Reading**: Share self-destructs atomically on first view
  - **UI components**: `burn-after-reading-toggle.tsx`, `burn-after-reading-tracker.tsx`, `burned-state.tsx`
  - **Immutable once viewed**: View flag prevents re-access, secure + user-friendly
- **Private Shares**: Hidden from search, owner-only access (RLS enforced)
- **Rate Limiting**: 10 req/min per IP (upload/API); 5 attempts/10 min per IP (password)

### Advanced Features
- **Burn-After-Reading**: Share self-destructs on first view
- **Version History**: Track revisions, restore previous versions
- **Comments**: Thread discussion on shared content
- **Multi-File Support**: Multiple files per share (tabs + sidebar)
- **QR Code Generation**: Auto-generate + download QR for share URLs
- **Expiration Select**: Configurable expiry (5min to forever)

### Analytics
- **Page Views**: Automatic tracking on share view
- **Custom Events**: document_uploaded, content_published, share_viewed
- **Geographic**: IP-based location tracking
- **Referrer Tracking**: Where traffic originates
- **Vercel Analytics**: Web Vitals, page views, device breakdowns
- **Per-Share Dashboard**: Individual share metrics

### Team Collaboration
- **Workspaces**: Owner creates, invites members
- **Shared Content**: Assign shares to workspace
- **Role-Based Access**: owner vs. member roles
- **Invite System**: Single + bulk invite, token-based accept/decline
- **Activity Feed**: Team events tracking

### Programmatic Access
- **REST API v1**: `/api/v1/documents`, `/api/v1/keys` (Bearer auth)
- **CLI Tool**: `dropitx` binary (publish, update, delete, list, login)
- **API Keys**: SHA-256 hashed, soft-revokable
- **oEmbed**: Standardized content embedding for WordPress/Medium

## Authentication & Authorization

### Session Auth (Browser)
- **OAuth**: Google + GitHub via Supabase Auth
- **Email/Password**: Signup + confirmation + password reset (PKCE flow)
- **Session**: Supabase SSR cookies (HttpOnly, SameSite=Lax)
- **JWT**: Sent to FastAPI backend as Bearer token

### API Key Auth (Programmatic)
- **Key Format**: `shk_` prefix + 48 hex chars
- **Storage**: SHA-256 hash only (plaintext never stored)
- **Revocation**: Soft-delete via `revoked_at` timestamp
- **Rate Limit**: Same as session auth (10 req/min)

### Share Access (Password-Protected)
- **Unlock Flow**: POST `/shares/[slug]/unlock` with password
- **Cookie**: HMAC-SHA256 signed, HttpOnly, 24h TTL
- **Gate Order**: Owner bypass → private check → access cookie → password → login redirect

## Database

### Core Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `shares` | Content storage | slug, filename, content_text, mime_type, user_id, password_hash, is_private, expires_at, view_count, encrypted, encryption_iv |
| `user_profiles` | User metadata | display_name, avatar_url |
| `favorites` | Bookmarked shares | user_id, share_id |
| `api_keys` | Programmatic auth | user_id, key_hash, key_prefix, revoked_at |
| `team_workspaces` | Team organization | name, owner_id |
| `workspace_members` | Team members | workspace_id, user_id, role (owner/member) |
| `workspace_shares` | Workspace content | workspace_id, share_id |
| `analytics_events` | Usage metrics | event_type, user_id, session_id, metadata, ip_address |

### RLS Policies
- All tables enforce user-based or role-based access control
- `is_private` shares filterable for non-owners
- Team tables require workspace membership
- Admin-only writes via service_role client

## Migrations (16 total)
- Auth tables + editor columns + API keys
- Password protection + rate limiting + view tracking
- Team workspaces + RLS fixes + team lifecycle redesign
- Invite accept/decline + ambiguous team_id fixes

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/public key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server-only) | `eyJhbG...` |
| `UPSTASH_REDIS_REST_URL` | Redis endpoint | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | `xxx` |
| `SHARE_ACCESS_SECRET` | 32+ char secret for HMAC signing | (random string) |
| `NEXT_PUBLIC_API_URL` | FastAPI backend | `https://dropitx-api.onrender.com` |

## Recent Changes (v1.4.1 — 2026-04-26)

### Bug Fixes
- Fixed search page blank/stuck when navigating from dashboard while logged in
- Replaced unreliable `searchParams` Promise prop with `useSearchParams()` hook
- Added `AbortController` to cancel stale fetches on rapid input

### v1.4.0 (2026-04-26)
- Vercel Analytics integration with custom event tracking
- PII sanitization in analytics (strips query params from URLs)

### v1.3.1 (2026-04-26)
- HeaderBar compound component system (responsive navigation)
- Consolidated header + dashboard sidebar layout

### v1.3.0 (2026-04-25)
- **Brand Refresh**: ShareHTML → DropItX rebrand
- **Design System**: Blue (hue 264) → Violet (hue 293), orange accents
- **Logotype**: `[x] dropitx` in Geist Mono
- **CLI Rename**: `share-html` → `dropitx`

### v1.2.0 (2026-04-25)
- Password-protected shares with bcryptjs
- Rate limiting migrated from Upstash Redis to Supabase Postgres
- Share views gated behind login or password

### v1.1.0 (2026-04-24)
- Markdown editor (CodeMirror 6) with split-pane preview
- Inline image upload + drag-drop
- Slash commands
- Editor auto-save + dirty-state warning
- REST API v1 for programmatic management
- CLI tool (`dropitx` binary)
- Private shares support
- API key management UI

### v1.0.0 (2026-04-23)
- Initial MVP: file upload, search, auth, dashboard, themes

## Development Workflow

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev        # http://localhost:3000

# Build for production
npm run build

# Lint
npm lint

# CLI development
cd packages/cli && npm run build && npm link
```

## Key Architectural Decisions

1. **Frontend-Only Next.js**: Pure client-side app; all API logic in FastAPI backend for scalability
2. **Supabase for Auth + Storage**: Manages user sessions, OAuth, and file storage with RLS
3. **CodeMirror 6 SSR Disabled**: Loaded via `next/dynamic` to avoid build-time errors
4. **Web Crypto API**: Client-side encryption for E2E feature without server key storage
5. **localStorage Drafts**: Offline-first editor with auto-recovery on page reload
6. **Token-Based Invites**: Secure, shareable invite links with email validation
7. **RLS as Primary Auth**: Database-level security enforced at Postgres layer
8. **Vercel Analytics**: Automatic Web Vitals + custom event tracking (PII-safe)

## Known Gaps

- **No test suite**: Zero unit/integration/E2E tests (planned for future hardening phase)
- **No offline support**: Service Worker for offline drafts planned
- **Limited mobile UX**: Mobile-responsive but not native app
- **Comment moderation**: No spam filtering or content moderation tools
- **Custom branding**: White-label/custom domain not yet supported

## Files to Start With

1. **`app/layout.tsx`** - Root layout and global setup
2. **`components/home-page.tsx`** - Landing page orchestrator
3. **`app/(dashboard)/dashboard/page.tsx`** - Dashboard entry
4. **`lib/api-client.ts`** - Backend communication (JWT Bearer auth)
5. **`components/editor-shell.tsx`** - Editor entry point (CodeMirror 6)
6. **`components/share-page-client.tsx`** - Share viewer logic
