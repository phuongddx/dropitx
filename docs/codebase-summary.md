# Codebase Summary

## Overview

DropItX is a Next.js 16 (App Router) application for uploading HTML/Markdown files, writing in a built-in Markdown editor, and generating short shareable links. Features include team workspaces, analytics dashboard, password-protected shares, rich embedding via oEmbed, and programmatic access via REST API and CLI. Deployed on Vercel with Supabase (PostgreSQL + Storage) and Upstash Redis.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Editor | CodeMirror 6, loaded via `next/dynamic` (ssr: false) |
| Viewer | `react-markdown` + `remark-gfm` + shiki |
| Database | Supabase PostgreSQL (RLS), Storage (S3-compatible) |
| Auth | Supabase Auth (Google + GitHub OAuth, PKCE), `@supabase/ssr` |
| Styling | Tailwind CSS 4, shadcn/ui, OKLCH color tokens |
| Rate limiting | Upstash Redis |
| File upload | `react-dropzone` |
| Theming | `next-themes` |
| Analytics | Vercel Analytics + custom `analytics_events` table |
| CLI | `packages/cli/` — TypeScript ESM, binary `dropitx` |

## File Structure Overview

```
app/
├── layout.tsx, page.tsx, globals.css, not-found.tsx, error.tsx
├── editor/page.tsx                     # Markdown editor (SSR-disabled)
├── s/[slug]/page.tsx, loading.tsx      # Public share viewer
├── s/[slug]/embed/page.tsx            # Embed-friendly viewer
├── search/page.tsx, loading.tsx        # Full-text search
├── dashboard/
│   ├── layout.tsx, page.tsx            # Share list + stats + API keys
│   ├── profile/page.tsx
│   ├── favorites/page.tsx
│   ├── analytics/page.tsx              # Analytics dashboard with charts
│   ├── teams/page.tsx                  # Team workspace list
│   ├── teams/new/page.tsx             # Create new workspace
│   ├── teams/[slug]/page.tsx           # Workspace details
│   ├── teams/[slug]/members/page.tsx  # Member management
│   ├── teams/[slug]/settings/page.tsx # Workspace settings
│   └── teams/[slug]/shares/page.tsx   # Workspace content
├── auth/
│   ├── login/page.tsx
│   └── callback/route.ts              # PKCE code exchange
└── api/
    ├── upload/route.ts                # POST multipart ≤50 MB
    ├── publish/route.ts               # POST editor publish
    ├── images/upload/route.ts         # POST inline images ≤5 MB
    ├── search/route.ts                # GET full-text search
    ├── shares/[slug]/route.ts         # GET/PATCH/DELETE owner CRUD
    ├── shares/[slug]/set-password/route.ts  # Share password management
    ├── shares/[slug]/unlock/route.ts     # Password unlock with cookie
    ├── analytics/track/route.ts       # Event tracking
    ├── oembed/route.ts                # oEmbed JSON endpoint
    ├── oembed.xml/route.ts             # oEmbed XML endpoint
    └── v1/
        ├── keys/route.ts              # GET/POST api keys
        ├── keys/[id]/route.ts         # DELETE (revoke) api key
        └── documents/
            ├── route.ts               # POST create, GET list
            └── [slug]/route.ts        # GET/PATCH/DELETE

components/
├── ui/{button,card,input,sonner}.tsx
├── editor-shell.tsx, editor-pane.tsx, editor-preview.tsx
├── editor-toolbar.tsx, editor-publish-bar.tsx
├── upload-dropzone.tsx, share-link.tsx
├── search-bar.tsx, search-results.tsx
├── html-viewer.tsx, markdown-viewer.tsx, markdown-viewer-wrapper.tsx
├── dashboard-share-card.tsx, bookmark-toggle.tsx
├── api-key-manager.tsx, profile-form.tsx
├── auth-user-menu.tsx, home-page.tsx, theme-provider.tsx
├── header-bar.tsx, header-nav.tsx, header-mobile-drawer.tsx
├── analytics/{stats-cards,view-chart,geo-chart,referrer-chart,top-performers,empty-state}.tsx
├── teams/{create-team-form,team-member-row,team-nav,team-share-card,invite-member-dialog}.tsx
├── shares/{share-link,share-password-form,password-gate,share-viewed-tracker,share-analytics-tracker,embed-viewed-tracker,embed-snippet}.tsx

lib/
├── utils.ts, nanoid.ts, extract-text.ts, rate-limit.ts
├── api-auth.ts                        # API key hash + lookup
├── shiki-highlighter.ts
├── nav-links.ts                       # Navigation links configuration
├── use-auth-user.ts                   # Authentication state hook
├── share-access-cookie.ts             # Password access cookie management
├── team-utils.ts                      # Workspace utilities
├── invite-utils.ts                   # Invitation system helpers
├── analytics-track.ts                 # Event tracking helpers
├── oembed-utils.ts                   # oEmbed metadata generation
├── referrer-parser.ts                 # Referrer URL parsing
├── password.ts                        # Password hashing helpers
└── editor-extensions/                 # CodeMirror slash commands, image drop

utils/supabase/
├── client.ts, server.ts, middleware.ts

types/
└── share.ts

packages/cli/
├── package.json, tsconfig.json
└── src/
    ├── index.ts                       # CLI entry (binary: dropitx)
    └── commands/login,publish,update,delete,list,whoami

supabase/
├── schema.sql, config.toml
└── migrations/
    ├── 20260423000001_add_auth_tables.sql
    ├── 20260424000001_add_editor_columns.sql
    ├── 20260424000002_add_api_keys.sql
    ├── 20260424000003_private_search_filter.sql
    ├── 20260425000001_add_share_password.sql
    ├── 20260425045621_rate-limits-supabase.sql
    ├── 20260426000001_share_views.sql
    ├── 20260426000002_teams.sql
    ├── 20260428000001_fix_team_owner_trigger_rls.sql
    ├── 20260428000002_fix_team_members_rls_recursion.sql
    ├── 20260428000003_fix_teams_insert_policy.sql
    ├── 20260428000004_fix_rls_policies_use_anon_role.sql
    └── 20260428162629_fix_rls_policies_to_authenticated.sql

docs/                                  # Project documentation
public/                                # Static assets
```

## Application Pages

| Route | Description |
|-------|-------------|
| `/` | Upload dropzone, search bar |
| `/editor` | Markdown editor with live split-pane preview (CodeMirror, SSR-disabled) |
| `/s/[slug]` | Public share viewer (HTML iframe or Markdown prose) |
| `/s/[slug]/embed` | Embed-friendly share viewer (oEmbed) |
| `/search` | Full-text search |
| `/dashboard` | Auth user share list, stats, API key management |
| `/dashboard/profile` | Edit display name / avatar |
| `/dashboard/favorites` | Bookmarked shares |
| `/dashboard/analytics` | Analytics dashboard with charts and metrics |
| `/dashboard/teams` | Team workspace list and creation |
| `/dashboard/teams/[slug]` | Workspace details and settings |
| `/dashboard/teams/[slug]/members` | Member management |
| `/dashboard/teams/[slug]/shares` | Workspace shared content |
| `/dashboard/teams/new` | Create new workspace |
| `/auth/login` | OAuth sign-in (Google + GitHub) |
| `/auth/callback` | PKCE code-exchange, bootstraps `user_profiles` |

## API Routes

### Browser / Session Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload` | Multipart file upload (HTML/MD, max 50 MB) |
| POST | `/api/publish` | Editor publish (content, title, custom_slug, is_private) |
| POST | `/api/images/upload` | Inline image upload (PNG/JPG/GIF/WebP, max 5 MB) |
| GET | `/api/search?q=` | Full-text search via Postgres RPC |
| GET/PATCH/DELETE | `/api/shares/[slug]` | Owner CRUD |
| POST | `/api/shares/[slug]/set-password` | Set/remove password for share |
| POST | `/api/shares/[slug]/unlock` | Password verification with access cookie |
| POST | `/api/analytics/track` | Event tracking (page views, searches, etc.) |
| GET | `/api/oembed` | oEmbed JSON endpoint for content embedding |
| GET | `/api/oembed.xml` | oEmbed XML endpoint for WordPress |
| GET/POST | `/api/v1/keys` | List / create API keys |
| DELETE | `/api/v1/keys/[id]` | Soft-revoke API key |

### REST API (Bearer API Key)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/documents` | Create from Markdown content |
| GET | `/api/v1/documents` | List own documents (limit/offset) |
| GET | `/api/v1/documents/[slug]` | Get metadata + URL |
| PATCH | `/api/v1/documents/[slug]` | Update content/metadata |
| DELETE | `/api/v1/documents/[slug]` | Delete (204) |

## Component Architecture

### Editor Components
- **EditorShell**: Top-level editor layout, orchestrates sub-panels
- **EditorPane**: CodeMirror 6 instance; theme via Compartment hot-swap; slash commands + image drop extensions
- **EditorPreview**: Live Markdown rendering (react-markdown + shiki)
- **EditorToolbar**: Format actions, keyboard shortcuts
- **EditorPublishBar**: Title, custom slug, is_private toggle, publish button

### Upload / Share Components
- **UploadDropzone**: react-dropzone; state machine (idle/dragging/uploading/success/error)
- **ShareLink**: Share URL display, copy-to-clipboard, delete link
- **HtmlViewer**: Sandboxed iframe + CSP meta tag injection
- **MarkdownViewer**: react-markdown + remark-gfm + shiki, preview/raw toggle
- **MarkdownViewerWrapper**: `next/dynamic` wrapper for client-side only load

### Dashboard / Auth Components
- **DashboardShareCard**: Share card with stats, edit, delete, password lock toggle
- **ApiKeyManager**: Create/list/revoke API keys
- **BookmarkToggle**: Add/remove favorites
- **ProfileForm**: Edit display name and avatar
- **AuthUserMenu**: Header dropdown (profile, logout)

### Header Components
- **HeaderBar**: Main header orchestrator, manages responsive state
- **HeaderNav**: Desktop navigation links with responsive menu toggle
- **HeaderMobileDrawer**: Slide-out mobile navigation menu

### Core UI
- **SearchBar**: Debounced (300 ms) input → URL params navigation
- **SearchResults**: Paginated cards, skeleton loading, empty state
- **ThemeProvider**: next-themes class-based dark/light toggle

### Analytics Components
- **AnalyticsStatsCards**: Performance metrics cards
- **AnalyticsViewChart**: View count over time chart
- **AnalyticsGeoChart**: Geographic distribution
- **AnalyticsReferrerChart**: Referrer source analysis
- **AnalyticsTopPerformers**: Most popular content
- **AnalyticsEmptyState**: No data placeholder

### Team Components
- **CreateTeamForm**: Workspace creation interface
- **TeamMemberRow**: Member display with role and remove action
- **TeamNav**: Workspace navigation sidebar
- **TeamShareCard**: Share card in workspace context
- **InviteMemberDialog**: Email invitation system

### Share Protection Components
- **PasswordGate**: Full-page password form for protected shares
- **SharePasswordForm**: Set/remove password UI
- **ShareViewedTracker**: Analytics tracking for shares
- **EmbedViewedTracker**: Analytics tracking for embeds
- **EmbedSnippet**: oEmbed embed code generator

## Library Modules

| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` class name helper (clsx + tailwind-merge) |
| `lib/nanoid.ts` | URL-safe slug + token generation |
| `lib/extract-text.ts` | HTML/Markdown text extraction for search indexing |
| `lib/rate-limit.ts` | Upstash Redis-based rate limiting |
| `lib/api-auth.ts` | SHA-256 hash + `api_keys` lookup for Bearer auth |
| `lib/shiki-highlighter.ts` | Shiki singleton, curated languages |
| `lib/editor-extensions/` | CodeMirror slash commands, image drag-and-drop |
| `lib/share-access-cookie.ts` | HMAC-SHA256 cookie management for password protection |
| `lib/team-utils.ts` | Workspace management helpers |
| `lib/invite-utils.ts` | Invitation system helpers |
| `lib/analytics-track.ts` | Event tracking helpers |
| `lib/oembed-utils.ts` | oEmbed metadata generation |
| `lib/referrer-parser.ts` | Referrer URL parsing |
| `lib/password.ts` | Password hashing with bcryptjs |

## Database Schema (8 Tables)

| Table | Key Columns |
|-------|------------|
| `shares` | id, slug, filename, storage_path, content_text, search_vec, file_size, mime_type, delete_token, user_id, title, custom_slug, source, is_private, password_hash, expires_at, view_count |
| `user_profiles` | id (FK auth.users), display_name, avatar_url |
| `favorites` | id, user_id, share_id, UNIQUE(user_id, share_id) |
| `api_keys` | id, user_id, name, key_hash, key_prefix, last_used_at, revoked_at |
| `team_workspaces` | id, name, description, owner_id, created_at, updated_at |
| `workspace_members` | id, workspace_id, user_id, role, created_at, UNIQUE(workspace_id, user_id) |
| `workspace_shares` | id, workspace_id, share_id, user_id, created_at, UNIQUE(workspace_id, share_id) |
| `analytics_events` | id, event_type, user_id, session_id, metadata, user_agent, ip_address, created_at |

## CLI Tool (`packages/cli/`)

Binary: `dropitx`. Config: `~/.dropitx/config.json` (mode 0600).

| Command | Description |
|---------|-------------|
| `login` | Store API key to config |
| `publish <file> [-t title] [-p] [-s slug] [-P password]` | Publish file with optional password |
| `update <slug> <file>` | Update content via PATCH |
| `delete <slug>` | Delete document |
| `list [-n limit]` | List own documents |
| `whoami` | Show current user info |

## Key Architectural Patterns

- **Dual auth model**: Cookie session (browser) + API key (programmatic); `lib/api-auth.ts` handles key hashing
- **Compensating transactions**: Delete storage object if DB insert fails
- **Soft revocation**: `revoked_at` preserves `api_keys` audit history
- **RLS layering**: All 8 tables have RLS; private shares hidden unless owner; admin client bypasses for mutations
- **Generated TSVECTOR**: Full-text search with GIN index + `search_shares` RPC; private filter in RPC
- **CodeMirror SSR guard**: Editor loaded via `next/dynamic { ssr: false }`; theme via Compartment hot-swap
- **Auto-draft**: `useEditorAutoSave` persists to localStorage; dirty-state unload warning
- **Custom slugs**: `handle/slug` format stored in `custom_slug`; partial unique index
- **Password protection**: bcryptjs hash with HMAC-SHA256 access cookies; view gate security layers
- **Team workspaces**: Role-based access control with RLS; owner/member permissions
- **Analytics tracking**: Event-based system with `analytics_events` table and Vercel integration
- **oEmbed support**: Standardized content embedding with JSON/XML response formats

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `SHARE_ACCESS_SECRET` | 32+ char secret for HMAC cookie signing (password protection) |

## Recent Major Features

### v2.0.1 (2026-04-28)
- RLS policy hardening for team workspaces
- Fixed infinite recursion and permission errors
- Authentication role migration from anon to authenticated

### v2.0.0 (2026-04-26)
- Team workspaces with role-based access control
- Analytics dashboard with real-time charts and metrics
- oEmbed support for rich content embedding
- Password protection for shares
- Vercel Analytics integration

## Development Commands

```bash
npm run dev     # Development server
npm run build   # Production build + TypeScript check
npm run lint    # ESLint

# CLI:
cd packages/cli && npm run build && npm link
dropitx login
dropitx publish README.md -t "My Doc"
```

## Migration Strategy

All schema changes are managed via timestamped SQL migrations in `supabase/migrations/`. Apply with:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Always run migrations in chronological order. The 14 migrations cover auth, editor, API keys, password protection, rate limiting, analytics, teams, and RLS fixes.