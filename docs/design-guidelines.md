# Design Guidelines

## Overview

DropItX uses Tailwind CSS 4 + shadcn/ui for styling. Design tokens defined in `app/globals.css` via CSS custom properties with OKLCH color space. The Agentic design system uses orange (#FF5701) as the primary accent with warm gray neutrals and Playfair Display for headings.

## Design Principles

- **Simplicity**: Minimal UI — upload, share, search, write
- **Accessibility**: WCAG 2.1 AA contrast, keyboard nav, semantic HTML
- **Theme**: Light/dark via `next-themes` + `ThemeProvider`

## Color System

All theme variables in `app/globals.css` using `oklch()`. Primary accent is orange (#FF5701, `oklch(0.655 0.222 47)`). All neutrals use warm gray (H=47) — not cool gray.

| Token | Light Value | Purpose |
|-------|-------------|---------|
| `--primary` | `oklch(0.655 0.222 47)` | CTAs, links, orange accent |
| `--primary-foreground` | `oklch(1 0 0)` | White text on orange |
| `--background` | `oklch(1 0 0)` | Page background |
| `--foreground` | `oklch(0.14 0.005 47)` | Body text, warm tint |
| `--card`, `--card-foreground` | White / warm dark | Card surfaces |
| `--secondary` | `oklch(0.965 0.004 47)` | Secondary actions |
| `--muted`, `--muted-foreground` | Warm gray | Subtle/disabled text |
| `--accent`, `--accent-foreground` | Warm gray | Highlights |
| `--destructive` | `oklch(0.577 0.245 27)` | Error/danger (red, unchanged hue) |
| `--success` | `oklch(0.623 0.178 155)` | Success (green, unchanged hue) |
| `--border`, `--input`, `--ring` | Warm gray / orange | Borders, focus rings |
| `--radius` | `0.375rem` | Border radius |

### Computed Tokens

- `--accent-soft`: `color-mix(in oklch, var(--primary) 10%, var(--card))`
- `--accent-line`: `color-mix(in oklch, var(--primary) 32%, var(--card))`
- `--fg-soft`: `color-mix(in oklch, var(--foreground) 4%, var(--card))`
- `--shadow`: `color-mix(in oklch, var(--foreground) 8%, transparent)`

### Data Visualization Palette

Charts use distinct hues for pie/bar slices — NOT monochrome orange.

| Token | Value | Purpose |
|-------|-------|---------|
| `--chart-1` | `oklch(0.655 0.222 47)` | Primary orange |
| `--chart-2` | `oklch(0.623 0.178 155)` | Teal/green |
| `--chart-3` | `oklch(0.65 0.17 80)` | Amber/yellow |
| `--chart-4` | `oklch(0.55 0.19 300)` | Rose/magenta |
| `--chart-5` | `oklch(0.60 0.15 200)` | Sky blue |

`.dark` class overrides all tokens for dark mode (higher L, lower C, same H).

## Typography

- **Body font**: Inter (`--font-sans`) — weights 300, 400, 500, 600, 700
- **Display font**: Playfair Display (`--font-display`) — weights 400, 700, 900 — used for h1-h3 and hero text
- **Mono font**: JetBrains Mono (`--font-mono`) — weights 400, 500, 600, 700
- `--font-heading` aliased to `--font-display` for backward compatibility (card.tsx, page-header.tsx)
- Type scale: 14/16/18/24/32/40
- Fluid headings via `.heading-fluid-lg` (clamp 48-88px) and `.heading-fluid-md` (clamp 28-46px)

## Component Library

### UI Components (`components/ui/`)
- **Button**: Variants via `class-variance-authority` (default, outline, secondary, ghost, destructive, link) + sizes (default, xs, sm, lg, icon)
- **Card**: Container with Header, Content, Footer, Title, Description, Action subcomponents
- **Input**: Base UI Input primitive with consistent styling
- **Textarea**: Multi-line input component with consistent styling
- **Dialog**: Modal dialog component for user interactions
- **Select**: Dropdown select component for single/multiple selections
- **Badge**: Status and indicator component with various styles
- **Alert**: Contextual alert component with different severity levels
- **Toaster**: Sonner toast with theme-aware Lucide icons
- **Skeleton**: Loading state component matching final layout

### Upload / Share Components
- **UploadDropzone**: react-dropzone; state machine (idle/dragging/uploading/success/error); full-width mobile, max-w-2xl centered desktop
- **ShareLink**: Share URL display + copy-to-clipboard + delete link
- **HtmlViewer**: Sandboxed iframe + CSP meta tag injection for secure HTML rendering
- **MarkdownViewer**: react-markdown + remark-gfm + shiki; preview/raw toggle; GitHub-like prose styles
- **MarkdownViewerWrapper**: `next/dynamic` wrapper (client-side only)

### Editor Components
- **EditorShell**: Top-level editor layout; split-pane at `lg:` breakpoint
- **EditorPane**: CodeMirror 6; monospace font; theme follows system dark/light via Compartment
- **EditorPreview**: Live Markdown rendering; matches MarkdownViewer prose styles
- **EditorToolbar**: Format action buttons; keyboard shortcut labels
- **EditorPublishBar**: Title input, custom slug input, privacy toggle, publish button; sticky at bottom

### Dashboard / Auth Components
- **DashboardShareCard**: Share card with title, slug, stats (views), edit/delete actions, password lock toggle
- **ApiKeyManager**: Table of API keys (prefix, created_at, last_used_at); create/revoke actions
- **BookmarkToggle**: Icon button; filled/outline state; optimistic update
- **ProfileForm**: Display name + avatar URL inputs with save feedback
- **AuthUserMenu**: Header dropdown; avatar or initials fallback; profile + logout links
- **AnalyticsStatsCards**: Performance metrics cards for dashboard analytics view
- **AnalyticsCharts**: Recharts-based visualization components for user engagement data

### Header Components
- **HeaderBar**: Main header orchestrator; manages mobile/desktop state and mobile drawer
- **HeaderNav**: Desktop navigation links; responsive menu toggle for mobile
- **HeaderMobileDrawer**: Slide-out mobile navigation with backdrop and close functionality

### Search / Navigation
- **SearchBar**: Debounced (300 ms) input → URL params navigation
- **SearchResults**: Result cards with relative time, skeleton loading, empty state
- **ThemeProvider**: next-themes class-based dark/light toggle

### Team Components
- **CreateTeamForm**: Workspace creation interface with name/description inputs
- **TeamMemberRow**: Member display with role indicator and remove action
- **TeamNav**: Workspace navigation sidebar with member list
- **TeamShareCard**: Share card within workspace context with workspace actions
- **InviteMemberDialog**: Email-based invitation system for workspace members
- **TeamInviteForm**: Enhanced invite form with role selection and email validation
- **EnhancedInviteDialog**: Invite dialog with team RPC client and link generation
- **BulkInviteDialog**: Bulk invitation system supporting multiple email addresses
- **InviteAcceptForm**: Accept invitation and join team flow
- **InviteStatusCard**: Invite status tracking and management
- **CopyButton**: Copy-to-clipboard component for share links

## Spacing

8pt grid convention: use even Tailwind spacing values (2=8px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px). Consistent `p-4`/`p-6` padding for cards. `gap-6`/`gap-8` for layouts.

## Responsive Design

Tailwind breakpoints (mobile-first):

| Breakpoint | Width | Usage |
|------------|-------|-------|
| default | < 640px | Stacked single-column |
| `sm:` | 640px | |
| `md:` | 768px | Two-column grids |
| `lg:` | 1024px | Editor split-pane, share page sidebar |

- Upload area: full-width on mobile, `max-w-2xl` centered on desktop
- Editor: single pane on mobile, split 50/50 on `lg:`
- Share page: stacked on mobile, sidebar layout on `lg:`

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| File upload | Drag-and-drop + click fallback; visual state feedback |
| Copy to clipboard | `navigator.clipboard.writeText` with fallback |
| Search | Debounced input → URL params → API call → results |
| Theme toggle | Class-based `.dark` on `<html>` |
| OAuth login | Button click → Supabase OAuth redirect → callback |
| Email authentication | Split-screen login with form validation and PKCE flow |
| Team invite | Single invite with role selection, bulk invite, resend functionality |
| Favorites toggle | `BookmarkToggle`; optimistic update; auth-gated |
| Editor publish | `EditorPublishBar`; validates title; submits to `/api/publish` |
| Slash commands | Type `/` in `EditorPane`; command palette overlay |
| Image drop in editor | Drop image → `POST /api/images/upload` → insert `![alt](url)` |
| Error handling | Sonner toast; error boundary for unhandled errors |
| Loading states | Skeleton components matching final layout |
| Invite flow | Form validation → server validation → success feedback |

## Security in UI

- **HtmlViewer**: Sandboxed iframe (`sandbox="allow-scripts"`) + CSP meta tag injection
- **File validation**: Extension (`.html`/`.htm`/`.md`), size (≤ 50 MB) checks client-side; MIME validation server-side
- **Image validation**: Extension + size (≤ 5 MB) client-side hint; full validation server-side
- **Rate limiting**: 10 requests/minute per IP on write endpoints; 5 attempts/10 min for password unlock
- **Password protection**: bcryptjs hash with HMAC-SHA256 access cookies; multi-layer access gates
- **Team workspace isolation**: RLS policies ensure members only see their own workspace content
