# Share HTML

Drop HTML and Markdown files, get short shareable links. Built with Next.js 16, Supabase, and Tailwind CSS.

## Features

- **Upload**: Drag-and-drop HTML and Markdown files (up to 50MB)
- **Markdown**: GitHub-like rendered preview with syntax highlighting, toggle to raw source
- **Share**: Short slug-based URLs (`/s/abc123`)
- **Search**: Full-text search across uploaded content
- **Security**: Sandboxed iframe viewing with CSP, rate limiting
- **Themes**: Light/dark mode
- **Auto-expire**: Shares expire after 30 days

## Tech Stack

- **Next.js 16** (App Router, React 19)
- **Supabase** (PostgreSQL, Storage, SSR cookie sessions)
- **Tailwind CSS 4** + shadcn/ui
- **Upstash Redis** (rate limiting)
- **TypeScript 5**

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (or local via Supabase CLI)

### Setup

```bash
# Install dependencies
npm install

# Environment variables (see Deployment Guide)
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

### Database Setup

Do not stop at `supabase/schema.sql`.

`supabase/schema.sql` is the base share schema. Auth/dashboard support lives in `supabase/migrations/`.

Recommended:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

If applying SQL manually, run `supabase/schema.sql` and then every file in `supabase/migrations/` in timestamp order.

That setup creates:
- `shares` table with full-text search
- `user_profiles` and `favorites`
- `search_shares()` and `increment_view_count()` RPCs
- Storage bucket `html-files` (public, 50MB max)

## Project Structure

```
app/                  # Next.js App Router pages and API routes
components/           # React components (ui/ for primitives)
lib/                  # Utility functions (nanoid, extract-text, rate-limit)
utils/supabase/       # Supabase client factories (browser, server, admin)
types/                # TypeScript interfaces
supabase/             # Schema and config
public/               # Static assets
docs/                 # Project documentation
```

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run lint` — ESLint

## Documentation

See `docs/` for detailed documentation:
- [Project Overview](docs/project-overview-pdr.md)
- [System Architecture](docs/system-architecture.md)
- [Code Standards](docs/code-standards.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Project Roadmap](docs/project-roadmap.md)
