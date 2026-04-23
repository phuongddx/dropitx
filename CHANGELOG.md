# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-23

### Added

- HTML file upload with drag-and-drop interface
- Short slug-based share links (`/s/abc123`)
- Sandboxed HTML content viewer with CSP headers
- Markdown (.md) file upload support with GitHub-like rendered preview
- Shiki syntax highlighting for markdown code blocks (10 languages)
- Preview/raw toggle for markdown files
- Full-text search across uploaded content with pagination
- Rate limiting via Upstash Redis (10 req/min)
- Light/dark theme switching
- 30-day automatic share expiration
- Delete token-based authorization
- User authentication with Google and GitHub OAuth (Supabase Auth)
- User dashboard with share history
- Profile settings management
- Favorites/bookmark system
- Header user menu with auth integration

### Changed

- Migrated to Supabase SSR v3 with cookie-based sessions
- Increased upload size limit from 10MB to 50MB
- Full UI overhaul with blue accent design system

### Fixed

- Storage uploads now use admin client to bypass RLS
- Corrected markdown text extraction for search indexing
- Removed MIME type validation for broader browser support
- Used Uint8Array for storage upload body and improved error logging
- Hardened RLS policies and security definer trigger

### Security

- Sandboxed iframe viewing with Content Security Policy
- Row Level Security policies on all database tables
- Rate limiting on upload and search endpoints
- Server-side input validation and sanitization

### Tech Stack

- Next.js 16 (App Router, React 19)
- Supabase (PostgreSQL, Storage, Auth, SSR cookie sessions)
- Tailwind CSS 4 + shadcn/ui
- Upstash Redis (rate limiting)
- TypeScript 5
