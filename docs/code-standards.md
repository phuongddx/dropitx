# Code Standards

## Overview

Standards for the DropItX codebase. Next.js 16 + TypeScript strict + Tailwind CSS 4. Monorepo with `packages/cli/`.

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `UploadDropzone.tsx`, `EditorShell.tsx`, `ShareCard.tsx` |
| Utilities / Hooks | kebab-case | `api-client.ts`, `crypto.ts`, `use-auth-user.ts` |
| UI Primitives (shadcn) | kebab-case | `button.tsx`, `card.tsx`, `dialog.tsx` |
| Supabase Utils | kebab-case | `client.ts`, `server.ts`, `middleware.ts` |
| Pages (Next.js App Router) | `page.tsx`, `layout.tsx`, `route.ts` | No rename |
| Type Files | kebab-case | `share.ts`, `team.ts`, `analytics.ts` |
| Config Files | natural | `eslint.config.mjs`, `tsconfig.json`, `next.config.ts` |
| Migrations | timestamp + kebab-case | `20260424000001_add_editor_columns.sql` |

## Project Structure

```
app/                      # Next.js App Router (pages, layouts, API routes)
app/(public)/             # Public route group (landing, auth, editor, shares, search)
app/(dashboard)/          # Dashboard route group (sidebar layout, teams, analytics)
app/api/og-image/         # Only remaining Next.js API route
components/ui/            # Reusable UI primitives (shadcn/ui)
components/               # Feature components (landing, editor, dashboard, team, analytics)
lib/                      # Utility functions
lib/editor-extensions/    # CodeMirror extensions
utils/supabase/           # Supabase client factories
types/                    # TypeScript interfaces
supabase/                 # Schema and config
supabase/migrations/      # Incremental schema migrations
packages/cli/             # CLI tool (dropitx binary)
public/                   # Static assets
docs/                     # Documentation
```

## Monorepo Structure

`packages/cli/` is a standalone TypeScript ESM package:
- `package.json` with `"type": "module"`, `"bin": { "dropitx": "dist/index.js" }`
- Build: `tsc` outputs to `dist/`
- Local link: `npm link` from `packages/cli/` for development
- Config stored at `~/.dropitx/config.json` (mode 0600, never committed)

## TypeScript

- Strict mode enabled (`tsconfig.json`)
- Interfaces over types for object shapes
- DB column names use snake_case in types (matches Supabase): `storage_path`, `content_text`, `is_private`
- Prefer `async/await` over `.then()`
- Explicit return types on exported functions
- No `any` — use `unknown` and narrow

## React Patterns

- Functional components only (no classes)
- `"use client"` directive when using hooks, state, or browser APIs
- Server components by default for data-fetching pages
- Props via TypeScript interfaces, not PropTypes
- Keep components under 200 lines — split if larger
- CodeMirror: always load via `next/dynamic({ ssr: false })` — never import directly in server context

## Editor Integration (CodeMirror)

- Editor page at `app/editor/page.tsx` uses `next/dynamic({ ssr: false })` to load `EditorShell`
- `EditorPane` creates a single CodeMirror `EditorView`; do not re-create on re-render
- Theme switching via `Compartment` hot-swap (`compartment.reconfigure(...)`)
- Slash commands and image drop registered as CodeMirror extensions in `lib/editor-extensions/`
- Auto-save hook (`useEditorAutoSave`) debounces writes to `localStorage`

## API Routes

**Note**: All API logic runs on a FastAPI backend (`dropitx-api.onrender.com`). The Next.js app is a pure frontend with only one remaining API route (`/api/og-image/[slug]`).

### Client-Side API Calls
- Use `authFetch()` from `lib/api-client.ts` for all authenticated requests
- `authFetch()` injects JWT Bearer token from Supabase session
- 401 responses trigger automatic session refresh + retry
- `getApiUrl()` returns `NEXT_PUBLIC_API_URL` for constructing API endpoints

### FastAPI Backend API Conventions
- All routes under `/api/v1/` use API key auth (Bearer token)
- Browser routes use JWT Bearer auth from Supabase session
- Team workspace routes: `/api/dashboard/teams/` with RLS policies
- Analytics tracking: `/api/analytics/track` for event metrics

### Team Workspace API Pattern
```typescript
// POST /api/dashboard/teams/[slug]/members
// RLS policies ensure only owners can add/remove members
// workspace_id extracted from route slug, user_id from auth

// Team Invite System Pattern
// Enhanced invite form with role selection and email validation
// Bulk invite with multiple email support
// Invite resend functionality with team RPC client
// Token security for invite token management
```

### Analytics Tracking Pattern
```typescript
// POST /api/analytics/track
// Event types: 'page_view', 'search', 'upload', 'api_call'
// metadata varies by event type (slug, query, file_size, etc.)
// both anonymous and authenticated user tracking
```

## Database Migrations

All schema changes live in `supabase/migrations/` as timestamped SQL files:
- **Naming**: `YYYYMMDDNNNNNN_description.sql` (e.g., `20260424000001_add_editor_columns.sql`)
- **Apply locally**: `supabase db reset` or `supabase db push`
- **Apply to hosted**: `supabase db push --linked`
- Never modify `schema.sql` for incremental changes — always add a migration file
- Each migration must be idempotent where possible (`IF NOT EXISTS`, `DO $$ ... $$`)

## Supabase Clients

Three client factories in `utils/supabase/`:

| Client | Export | Use Case |
|--------|--------|----------|
| Browser | `client.ts → createClient()` | Client components, user interaction |
| Server (anon) | `server.ts → createClient()` | Server components, reads (respects RLS) |
| Admin | `server.ts → createAdminClient()` | Writes, storage ops (bypasses RLS) |

Never use the admin client in client components — server-only.

## Error Handling

- API routes: try/catch → `{ error: message }` with appropriate HTTP status
- Components: Sonner toast for user-facing errors
- Rate limit: graceful degradation — if Redis unavailable, allow request but log warning
- Compensating transactions: if DB insert fails after storage upload, delete the stored file
- API key auth failures: return `401` with `{ error: "Unauthorized" }`

## Styling

- Tailwind CSS 4 utility classes only — no custom CSS-in-JS
- OKLCH color tokens via CSS custom properties in `app/globals.css`
- Token layers: `@theme inline` → Tailwind namespace bindings, `:root` and `.dark` → same dark-only system
- Token naming: `--{namespace}-{property}-{variant}` (e.g., `--primary`, `--accent-soft`, `--sidebar-ring`)
- `cn()` from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Component variants via `class-variance-authority`
- **Light-first default**: Clay system uses warm cream (#f7eee6) canvas with optional `.dark` companion for accessibility
- **Font usage**: `font-sans` (Inter) for all text/headings, `font-mono` (Geist Mono) for labels/code/metadata
- **Chart colors**: Use `--chart-1` through `--chart-5` tokens for data visualization — terracotta, matcha, blueberry, lemon, ube
- **Token colors**: All CSS variables in `app/globals.css` use hex for light mode (primary), `.dark` selector for dark companion
- **Primary accent**: `--primary` is terracotta (#9a5b3c), `--background` is warm cream (#f7eee6)
- **Radius tokens**: Clay uses generous, organic radii (14px, 22px, 34px, pill 9999px) — hardcoded, no calc
- **Shadows**: `--shadow` uses layered elevation (dark drop + light inset highlight) for three-dimensionality
- 8pt spacing grid: use even Tailwind spacing values

## Security

- **File upload**: validate extension, MIME type, size (≤ 50 MB) at FastAPI layer
- **Image upload**: validate MIME type (png/jpg/gif/webp), size (≤ 5 MB), require session auth
- **HtmlViewer**: sandboxed iframe (`sandbox="allow-scripts"`) + CSP meta tag injection
- **Delete token**: random 32-char string, required for file-upload share deletion
- **Slug validation**: regex pattern check on API routes
- **Service role key**: server-only — never expose to client bundle
- **API key**: only SHA-256 hash + prefix stored; full key shown once at creation
- **`is_private`**: enforced at RLS level and in `search_shares` RPC — not just application logic
- **Password protection**: bcryptjs hash in `shares.password_hash`; HMAC-SHA256 signed HttpOnly access cookie
- **Team workspaces**: RLS policies with owner/member role-based access control on workspace tables
- **JWT auth**: Supabase JWT sent as Bearer token to FastAPI; validated via JWKS
- **Team RPC client**: Type-safe server communication pattern using lib/team-rpc.ts
- **Token security**: Secure invite token management with lib/token-security.ts

## Lint & Build

```bash
npm run lint    # ESLint (next config)
npm run build   # TypeScript check + Next.js build
# CLI:
cd packages/cli && npm run build
```

Fix lint errors before commit. Build must pass before push.

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- No AI references in commit messages
- Keep commits focused on actual changes
- Never commit `.env.local`, `~/.dropitx/config.json`, or any secrets
