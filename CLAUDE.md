# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` — Start the development server at http://localhost:3000 with hot reload.

### Building & Deployment
- `npm run build` — Perform TypeScript type checking and build Next.js app for production.
- `npm start` — Run the production server (used by Vercel).

### Code Quality
- `npm run lint` — Run ESLint (next/core-web-vitals + TypeScript config). No formatters configured; lint errors must pass before committing.
- TypeScript checking is automatic during `npm run build` (strict mode enforced in tsconfig.json).

### Testing
No test framework is currently configured. Verify changes manually by running `npm run lint` and `npm run build`, or test interactively in the dev server.

## Architecture

### Directory Structure

**App Router segments** (`app/`):
- `app/(public)/` — Landing page, search, editor, and public share viewing (unauthenticated routes)
- `app/(dashboard)/` — Authenticated user dashboard (teams, analytics, profile, favorites)
- `app/api/` — Only `/api/og-image` for OG image generation and `/api/shares` for access cookie routes remain; most business logic is in the FastAPI backend

**Components & Styling**:
- `components/` — Feature components (kebab-case filenames, under 200 lines each)
- `components/ui/` — shadcn/ui primitive components (button, dialog, select, etc.)
- `lib/` — Utility modules: `api-client.ts` (authenticated fetch), `crypto.ts` (AES-256-GCM), `password.ts` (bcryptjs hashing), `analytics.ts` (Vercel Analytics), CodeMirror extensions
- `hooks/` — Custom React hooks (e.g., `use-auth-user.ts` for session data)
- `types/` — TypeScript interfaces for API responses and shared domain types
- `public/` — Static assets

### Authentication & Session Management

**Supabase SSR** handles OAuth (Google, GitHub) and JWT session tokens:
1. `middleware.ts` runs on every request to refresh Supabase session via `updateSession()` from `utils/supabase/middleware.ts`
   - Validates JWT locally (JWKS) and refreshes access token if expired
   - Rewrites rotated auth cookies back to both the request and response
   - **Must return the response carrying refreshed cookies** to prevent refresh-token reuse and logouts
2. Server components use `utils/supabase/server.ts` factory (respects RLS policies)
3. Client components use `utils/supabase/client.ts` factory

**Security headers** applied in middleware (HSTS, CSP, X-Frame-Options, Referrer-Policy).

### API Communication

Frontend calls the separate **FastAPI backend** via `authFetch()` from `lib/api-client.ts`:
```typescript
import { authFetch } from "@/lib/api-client";

// authFetch injects the Supabase JWT and handles 401 refresh retry
const response = await authFetch("/api/v1/documents", {
  method: "POST",
  body: JSON.stringify({ content, title, slug }),
});
```

Environment variable `NEXT_PUBLIC_API_URL` points to the backend (default: `http://localhost:8000` for dev).

### UI & Styling

- **Tailwind CSS 4** utilities with OKLCH color tokens in `app/globals.css`
- **shadcn/ui** components for consistency (button, dialog, select, etc.)
- **Lucide icons** for iconography
- **Dark mode default** (hardcoded `dark` class in HTML root; `next-themes` available for dynamic toggle)
- No Tailwind default palette colors for accents; use tokens like `bg-primary`, `text-violet-500` (violet is the brand color per v1.3.0 rebranding)

### Data Fetching & State

- **Server components by default**; `"use client"` only when using hooks or browser APIs
- **Direct Supabase queries** in server components (via `utils/supabase/server.ts`)
- **Client-side state** via React hooks and context (no state management library)
- **Draft storage** in localStorage for the editor (auto-save, unload warning)

### Editor & Markdown

**CodeMirror 6** powers the markdown editor with:
- Split-pane preview with scroll sync
- Slash commands (`/image`, `/heading`, `/code`)
- Image drag-and-drop upload (inline preview)
- Shiki syntax highlighting (GitHub-like rendered output)
- Server-side rendering disabled (requires browser APIs)

Located at `app/(public)/editor/page.tsx`; extensions in `lib/editor-extensions/`.

### Database & Migrations

**PostgreSQL via Supabase**:
- Base schema: `supabase/schema.sql`
- Timestamped migrations: `supabase/migrations/YYYYMMDDNNNNNN_description.sql`
- All tables enforce RLS (Row Level Security); public tables readable by unauthenticated users if `is_private = false`
- Auth table managed by Supabase; custom tables: `shares`, `profiles`, `teams`, `team_members`, `api_keys`, etc.

Apply migrations locally with `supabase db push` after editing.

### Naming Conventions

- **Filenames**: kebab-case (`upload-dropzone.tsx`, `api-client.ts`)
- **UI primitives**: single-word filenames (`button.tsx`)
- **Components**: functional, max 200 lines; prefer composition over nesting
- **Variables/functions**: camelCase
- **Types/interfaces**: PascalCase

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `next@16.2.4` | React metaframework with App Router |
| `react@19.2.4` | React core |
| `@supabase/ssr@0.10.2` | Supabase SSR (session management) |
| `@codemirror/*` | Markdown editor with extensions |
| `tailwindcss@4` | Utility-first CSS framework |
| `shadcn` | shadcn/ui component registry (not a direct dependency; managed via CLI) |
| `shiki@4.0.2` | Syntax highlighting for code blocks |
| `bcryptjs@3.0.3` | Password hashing for protected shares |
| `@vercel/analytics` | Web Vitals and event tracking |

### Imports & Path Alias

All imports use the `@/*` alias mapping to the repo root:
```typescript
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api-client";
import { createClient } from "@/utils/supabase/client";
```

## Notes for Agents

- **No tests**: Verify changes by linting and building locally.
- **TypeScript strict mode**: All code must type-check; no `any`; use `unknown` and narrow.
- **Server components default**: Only use `"use client"` when necessary (hooks, browser APIs).
- **SSR editor**: CodeMirror editor must have SSR disabled; always use dynamic imports with `ssr: false` in Next.js.
- **API key auth**: API keys are hashed (SHA-256) and never persisted in plaintext. Authentication bootstraps from session cookies.
- **Sibling repos**: The FastAPI backend lives in `dropitx-api/`; the CLI tool in `dropitx-cli/`.
