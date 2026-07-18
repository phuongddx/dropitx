# Design Guidelines

## Overview

DropItX uses Tailwind CSS 4 + shadcn/ui for styling. Design tokens defined in `app/globals.css` via CSS custom properties with OKLCH color space. The **DropItX Orange design system** features a deep warm-charcoal canvas, signature amber-orange primary, hairline borders, no shadows, and pill-shaped buttons with Geist Mono labels — energetic and developer-first.

## Design Principles

- **Dark-first**: Deep warm charcoal (#1E1B17) as default, orange as accent
- **Minimal**: No shadows, no gradients (exception: hero heading gradient text), hairline borders only
- **Orange as the only chromatic color**: All UI accents use the orange primary; everything else is neutral gray
- **Energy where it matters**: Orange highlights CTAs, active states, focus rings, and key metrics only
- **Accessibility**: WCAG 2.1 AA contrast, keyboard nav, semantic HTML
- **Pill shapes**: Rounded buttons and badges (8px border radius)

## Color System

All theme variables in `app/globals.css` using `oklch()`. The Orange system uses warm amber-orange (hue 55) as the signature primary on a warm-charcoal canvas.

| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | `oklch(0.15 0.005 56)` (#1E1B17) | Page canvas — deep warm charcoal |
| `--foreground` | `oklch(0.97 0.003 56)` (#F8F6F2) | Primary ink — warm white |
| `--card` | `oklch(0.19 0.006 56)` (#26221D) | Card surface |
| `--card-foreground` | `oklch(0.97 0.003 56)` (#F8F6F2) | Card text |
| `--primary` | `oklch(0.75 0.17 55)` (#F59E0B) | Buttons, CTAs, active states — signature orange |
| `--primary-foreground` | `oklch(0.15 0.005 56)` (#1E1B17) | Text on orange |
| `--secondary` | `oklch(0.22 0.007 56)` (#2B2722) | Secondary surfaces |
| `--muted` | `oklch(0.22 0.007 56)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.65 0.01 56)` (#8A847A) | Muted text |
| `--border` | `oklch(0.27 0.008 56)` (#353029) | Hairline borders |
| `--input` | `oklch(0.22 0.007 56)` | Input backgrounds |
| `--accent` | `oklch(0.75 0.17 55)` | Surface accent (same as primary) |
| `--destructive` | `oklch(0.62 0.22 27)` | Error/danger (red) |
| `--success` | `oklch(0.70 0.16 155)` | Success (green) |
| `--warning` | `oklch(0.80 0.15 85)` | Warning (amber-yellow) |
| `--ring` | `oklch(0.75 0.17 55)` | Focus rings — orange |
| `--radius` | `0.5rem` (8px) | Border radius — pill shapes |

### Extended Tokens

- `--accent-soft`: Secondary surface for hover states
- `--accent-line`: `oklch(0.32 0.01 56)` — lighter canvas for borders and dividers
- `--fg-soft`: `oklch(0.90 0.003 56)` — off-white for hover fills
- `--surface`: Card surface for nested components
- `--shadow`: `0 0 0 0 transparent` — no drop shadows
- `--upload-pulse-dim/bright`: Orange-tinted pulse for upload animation

### Data Visualization Palette

Charts use distinct hues for pie/bar slices — led by the orange primary.

| Token | Value | Purpose |
|-------|-------|---------|
| `--chart-1` | `oklch(0.75 0.17 55)` | Orange (primary) |
| `--chart-2` | `oklch(0.65 0.17 155)` | Green |
| `--chart-3` | `oklch(0.70 0.15 250)` | Blue |
| `--chart-4` | `oklch(0.80 0.15 85)` | Amber-yellow |
| `--chart-5` | `oklch(0.65 0.17 300)` | Purple |

No light mode override — the Orange system is dark-only. All components render in dark mode by default (`dark` class always present on `<html>`).

## Typography

- **Body font**: Inter (`--font-sans`) — weights 300, 400, 500, 600, 700 — for all body text and headings
- **Mono font**: Geist Mono (`--font-mono`) — weights 400, 500, 600 — for labels, eyebrows, code, metadata
- `--font-display` aliased to `--font-sans` for consistency (no display-specific typeface)
- Type scale: 11px (eyebrow), 12px (meta), 14px (body), 16px (default), 18px, 24px, 32px (lg heading), 40px+ (fluid)
- **Tracking (letter-spacing)**:
  - `.eyebrow`: 0.0875em (uppercase labels)
  - `.meta`: 0.075em (small text)
  - `.heading-fluid-lg`: -0.025em (large headings with negative tracking)
  - `.heading-fluid-md`: -0.0125em (medium headings)
- Fluid headings: `.heading-fluid-lg` (clamp 40–96px) and `.heading-fluid-md` (clamp 28–48px)

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
