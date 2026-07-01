# Repository Guidelines

DropItX is a file-sharing and markdown editing platform. The Next.js 16 frontend lives in this repo; a separate FastAPI backend serves the REST API. Supabase handles PostgreSQL, Storage, and OAuth.

## Project Structure

```
app/                      # Next.js App Router
  (public)/               # Landing, auth, editor, shares, search
  (dashboard)/            # Authenticated dashboard (teams, analytics, profile)
  api/                    # Only /api/og-image and /api/shares remain
components/               # Feature components (kebab-case filenames)
components/ui/            # shadcn/ui primitives
hooks/                    # Custom React hooks (use-*.ts)
lib/                      # Utilities (api-client, crypto, team-rpc, etc.)
lib/editor-extensions/    # CodeMirror 6 extensions
utils/supabase/           # Supabase client factories (client, server, middleware)
types/                    # TypeScript interfaces
supabase/migrations/      # Timestamped SQL migrations (YYYYMMDDNNNNNN_description.sql)
scripts/                  # Shell scripts (generate-api-types.sh)
docs/                     # Architecture, code standards, design guidelines
```

## Build, Test, and Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:3000
npm run build            # TypeScript check + Next.js production build
npm run lint             # ESLint (next/core-web-vitals + typescript config)
npm run generate-types   # Regenerate API type definitions from backend
```

No test framework is currently configured. Verify changes by running `npm run lint` and `npm run build` before pushing.

## Coding Style and Naming Conventions

- **TypeScript strict mode** enforced via `tsconfig.json`. No `any`; use `unknown` and narrow.
- **Filenames**: kebab-case for all files (`upload-dropzone.tsx`, `rate-limit.ts`). UI primitives are single-word (`button.tsx`).
- **Components**: functional only, under 200 lines. Server components by default; `"use client"` only when hooks or browser APIs are needed.
- **Path alias**: `@/*` maps to repo root. Import via `@/components/...`, `@/lib/...`, `@/hooks/...`.
- **Styling**: Tailwind CSS 4 utilities only. Use `cn()` from `lib/utils.ts` for conditional classes. OKLCH tokens defined in `app/globals.css`. Never use Tailwind default palette (e.g., `bg-purple-500`) for accent colors; use `bg-primary`.
- **Formatting**: 2-space indentation, double quotes, semicolons (matches ESLint config).

## Database Migrations

- Add new migrations in `supabase/migrations/` as `YYYYMMDDNNNNNN_description.sql`.
- Make migrations idempotent (`IF NOT EXISTS`, `DO $$ ... $$`).
- Apply locally with `supabase db reset` or `supabase db push`.

## Supabase Client Usage

Three factories in `utils/supabase/`:
- **`client.ts`** for browser components.
- **`server.ts`** for server components (respects RLS).
- **`server.ts` (admin)** for privileged writes (server-only; never import in client components).

## API Calls

Use `authFetch()` from `lib/api-client.ts` for all authenticated requests to the FastAPI backend. It injects the Supabase JWT and handles automatic refresh on 401.

## Security

- Never commit `.env.local` or service role keys.
- Service role key is server-only; never expose in client bundles.
- File uploads: validate extension, MIME, and size at the API layer.
- Password-protected shares use bcryptjs hashing with HMAC-signed HttpOnly cookies.

## Commit and Pull Request Guidelines

- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Keep commits focused on a single concern.
- No AI references in commit messages.
- Lint and build must pass before pushing.
