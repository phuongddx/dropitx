# Deployment Guide

## Prerequisites

- Node.js 20+, npm 8+
- Supabase project (hosted or local via CLI)
- Upstash Redis instance
- Vercel account (or compatible hosting)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |

## Supabase Setup

### 1. Create Project

via [Supabase Dashboard](https://app.supabase.com) or CLI:

```bash
supabase login
supabase init
```

### 2. Database Schema and Migrations

Do not bootstrap hosted projects with only `supabase/schema.sql`.

`supabase/schema.sql` contains the original share storage schema only. Auth/dashboard tables such as `user_profiles`, `favorites`, and `shares.user_id` live in `supabase/migrations/`.

Preferred path:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

If you are not using the CLI, run both:

1. `supabase/schema.sql`
2. every SQL file in `supabase/migrations/` in timestamp order

This creates:
- `shares` table with full-text search (TSVECTOR) and RLS
- `user_profiles` and `favorites`
- `shares.user_id` and `shares.title`
- GIN index on `search_vec` for fast search
- `search_shares(query, limit, offset)` RPC
- `increment_view_count(slug)` RPC

### 2a. Recovery for Already-Provisioned Projects

If your app is already deployed and profile reads fail with `PGRST205` / `Could not find the table 'public.user_profiles'`, the project is missing the auth migration.

Recovery:

1. Apply `supabase/migrations/20260423000001_add_auth_tables.sql`
2. Backfill profile rows for existing users:

```sql
insert into public.user_profiles (id, display_name, avatar_url)
select
  u.id,
  nullif(
    left(
      trim(
        regexp_replace(
          coalesce(
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'name',
            u.raw_user_meta_data->>'user_name',
            u.raw_user_meta_data->>'preferred_username',
            ''
          ),
          '<[^>]+>',
          '',
          'g'
        )
      ),
      100
    ),
    ''
  ) as display_name,
  case
    when coalesce(u.raw_user_meta_data->>'avatar_url', '') like 'https://%' then u.raw_user_meta_data->>'avatar_url'
    when coalesce(u.raw_user_meta_data->>'picture', '') like 'https://%' then u.raw_user_meta_data->>'picture'
    else null
  end as avatar_url
from auth.users u
left join public.user_profiles p on p.id = u.id
where p.id is null;
```

3. Verify REST access with an authenticated request or by loading `/dashboard/profile`

### 3. Storage Bucket

Create `html-files` bucket via Dashboard:
- **Public**: true (files served at public URLs)
- **File size limit**: 10MB
- **Allowed MIME types**: `text/html`

No storage policies needed — server uses service_role client which bypasses RLS.

### 4. Get Keys

Dashboard > Settings > API:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Upstash Setup

1. Create Redis database at [console.upstash.com](https://console.upstash.com)
2. Copy **REST URL** and **REST Token** to env vars
3. Rate limit config: 10 requests/minute sliding window per IP (defined in `lib/rate-limit.ts`)

## Local Development

```bash
npm install
cp .env.example .env.local  # fill in env vars
npm run dev                  # http://localhost:3000
```

## Vercel Deployment

### CLI

```bash
npx vercel login
npx vercel --prod
```

### Dashboard

1. Import GitHub repo at vercel.com/new
2. Framework preset: Next.js (auto-detected)
3. Add environment variables in Settings > Environment Variables
4. Deploy

### Build Config

No custom `vercel.json` needed. Next.js 16 is auto-detected. Defaults work out of the box.

## Production Checklist

- [ ] All 6 env vars set in Vercel
- [ ] Supabase schema applied (table + indexes + RPCs)
- [ ] Storage bucket `html-files` created (public, 10MB)
- [ ] Upstash Redis connected
- [ ] `npm run build` passes
- [ ] Upload, view, search, delete flows tested

## Maintenance

### Expired Share Cleanup

No automatic cleanup. Manual process:

```sql
-- 1. Find expired shares
SELECT id, storage_path FROM shares WHERE expires_at < NOW();

-- 2. Delete storage objects (via Dashboard or API)

-- 3. Delete database records
DELETE FROM shares WHERE expires_at < NOW();
```

Consider automating via Supabase Edge Function or pg_cron.

### Monitoring

- **Vercel**: Built-in analytics, function logs, error tracking
- **Supabase**: Dashboard for DB stats, storage usage, query performance
- **Upstash**: Dashboard for Redis metrics and rate limit hit rates
