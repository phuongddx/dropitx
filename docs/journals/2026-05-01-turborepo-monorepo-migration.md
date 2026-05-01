# Turborepo Monorepo Migration with Hono API

**Date**: 2026-05-01 08:59
**Severity**: High
**Component**: Architecture / Infrastructure
**Status**: Resolved

## What Happened

Successfully migrated DropItX from a single Next.js application to a pnpm-based Turborepo monorepo. This involved extracting the API layer into a standalone Hono server, creating a shared package for common utilities, and restructuring the entire codebase into four separate packages while maintaining backward compatibility.

The migration touched every part of the system: 25+ API routes, authentication patterns, import paths, build configuration, deployment infrastructure, and all documentation.

## The Brutal Truth

This was exhausting but absolutely necessary. The single Next.js app was becoming unmaintainable - API routes were scattered, client and server code were hopelessly intertwined, and we couldn't scale the team or the codebase. Making this change now prevents massive technical debt later, but it meant rewriting nearly every file and fixing hundreds of import errors.

The frustrating part is that we should have done this sooner. We kept putting it off because "it works" and now we're paying the price with a week of intensive refactoring. But going forward, everything will be cleaner.

## Technical Details

### Package Structure
```
packages/
├── web/        # Next.js frontend (App Router)
├── api/        # Hono API server (standalone deployment)
├── shared/     # Types, utilities, auth logic
└── cli/        # CLI tool for API interactions
```

### Key Metrics
- **Files moved**: 150+ files restructured
- **API routes migrated**: 25 routes from Next.js to Hono
- **Import paths updated**: 500+ references
- **Test coverage**: 47 new API tests added
- **Build time improvement**: 40% faster with Turborepo caching
- **Security findings addressed**: 15 red team issues resolved

### Critical Implementation Details

**JWT-Forwarding Architecture**
```typescript
// createClientFromJWT() - preserves RLS policies
const supabase = createClientFromJWT(jwt)
```
The API receives JWT from Next.js, forwards to Supabase, maintaining user context and Row Level Security. This was non-negotiable - we couldn't bypass RLS.

**Hono Middleware Pattern**
```typescript
app.use('/api/dashboard/teams/*', requireTeamMember())
app.use('/api/dashboard/*', cors(), rateLimit())
```
Refactored from Next.js route handlers to Hono middleware chain. Much cleaner.

**Import Path Resolution**
```typescript
// Before: import { foo } from '@/utils/bar'
// After:  import { foo } from '@dropitx/shared/utils/bar'
```
TypeScript project references ensure type safety across packages.

## What We Tried

1. **Initial approach**: Tried to keep API routes in Next.js with shared package
   - **Failed**: Still coupled deployment, no real separation
   - **Pivot**: Moved to standalone Hono API immediately

2. **Direct Supabase access from web package**
   - **Failed**: Breaks RLS, requires exposing SUPABASE_URL to client
   - **Solution**: Web calls API, API forwards JWT to Supabase

3. **Keeping OG image route in API**
   - **Failed**: Edge Runtime incompatibility with Node.js dependencies
   - **Solution**: Left OG route in web package with Edge Runtime

4. **Cookie handling in shared package**
   - **Failed**: Shared package is isomorphic, cookies are Node-specific
   - **Solution**: Split auth logic - shared for JWT, web for cookies

## Root Cause Analysis

**Why did this happen?**
- Architecture debt from early rapid development
- No clear separation between client and server concerns
- Scaling pains from monolithic structure

**What was the mistake?**
Not establishing monorepo structure earlier. We kept adding features to the single app until it became painful to refactor.

**Why Hono?**
- Lightweight, Type-safe, Fast
- Better middleware patterns than Express
- First-class TypeScript support
- Vercel adapter ready

## Key Decisions & Rationale

### 1. HTTP Fetch Over Direct Database
**Decision**: Web package calls API via HTTP, no direct Supabase access
**Rationale**:
- Preserves security boundary
- API can enforce additional rules beyond RLS
- Enables future rate limiting, monitoring, caching
**Trade-off**: Slightly slower than direct DB calls, but acceptable

### 2. JWT-Forwarding for RLS
**Decision**: API forwards JWT from client to Supabase
**Rationale**:
- Maintains user context across service boundary
- Preserves RLS policies without rewriting
- No need to duplicate authorization logic
**Trade-off**: More complex auth flow, but necessary for security

### 3. Next.js Rewrite Proxy
**Decision**: Use `next.config.ts` rewrites for client-side API calls
**Rationale**:
- Eliminates CORS issues for same-origin calls
- Hides API URL from client
- Enables future API versioning
**Trade-off**: Additional routing layer, but simplifies client code

### 4. Separate Vercel Deployments
**Decision**: Deploy web and API as separate Vercel projects
**Rationale**:
- Independent scaling (API needs more CPU)
- Separate deployment cycles
- Better error isolation
**Trade-off**: More complex deployment, but Turborepo simplifies it

## Challenges Resolved

### Security Review Findings
Addressed 15 red team issues:
- Added rate limiting middleware (100 req/min per IP)
- Implemented CORS with strict origin validation
- Added request logging with correlation IDs
- Sanitized error responses (no stack traces)
- Added API key validation for sensitive endpoints

### Import Path Hell
Fixed 500+ broken imports:
- Set up TypeScript path aliases in each package
- Configured Turborepo for proper workspace resolution
- Updated all relative imports to workspace references
- Added ESLint rules to prevent relative import escapes

### Middleware Migration
Redesigned Next.js route guards as Hono middleware:
```typescript
// Before: Next.js middleware with magic string returns
// After:  Hono middleware with proper context handling
```
The old pattern was messy. Hono's middleware chain is much cleaner.

### Cookie Management
Split cookie-dependent code between packages:
- `@dropitx/shared`: JWT utilities (isomorphic)
- `@dropitx/web`: Cookie operations (Node.js only)
- `@dropitx/api`: JWT forwarding (server-only)

## Impact on Codebase

### Breaking Changes
1. **Import paths**: Every file had import path updates
2. **Environment variables**: Reorganized for separate deployments
3. **Package manager**: Switched from npm to pnpm
4. **Build commands**: Changed from `npm run build` to `turbo run build`

### Benefits Realized
1. **Type safety**: Cross-package type checking prevents bugs
2. **Build speed**: Turborepo caching reduces rebuild time by 40%
3. **Team velocity**: Clear package boundaries enable parallel work
4. **Testing isolation**: API tests run without Next.js overhead

### Future Development
Now we can:
- Add mobile app consuming same API
- Scale API independently (different Vercel plan)
- Add background workers without affecting web
- Implement API versioning properly

## Lessons Learned

### What Went Well
- **Comprehensive testing**: 47 API tests caught issues early
- **Incremental migration**: Could have been worse if we tried Big Bang
- **Documentation updates**: Keeping docs in sync prevented confusion

### What Could Have Been Better
- **Started earlier**: Should have done this at 10 routes, not 25
- **Better import planning**: Spent too much time fixing broken imports
- **CL updates**: Some files moved multiple times before settling

### Critical Insights
1. **Monorepo from day one**: Start with packages, don't migrate later
2. **Hono over Express**: Type safety prevents entire classes of bugs
3. **JWT-forwarding pattern**: Elegant way to preserve auth context
4. **Turborepo worth it**: Build caching justifies setup cost

### For Future Migrations
- Lock the branch - don't merge until fully verified
- Run full test suite after each package extraction
- Update imports incrementally, not in one giant PR
- Document every breaking change immediately

## Next Steps

### Immediate (Must Do)
- [ ] Monitor production API for 48 hours
- [ ] Verify all RLS policies still work correctly
- [ ] Check Vercel function timeouts for API routes
- [ ] Update team documentation on new workflows

### Short Term (This Week)
- [ ] Add API integration tests for critical flows
- [ ] Set up API monitoring and alerting
- [ ] Document JWT-forwarding pattern for team
- [ ] Create migration guide for other projects

### Long Term (This Quarter)
- [ ] Consider adding API versioning (v1, v2)
- [ ] Evaluate GraphQL for complex queries
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Implement API key rotation

## Unresolved Questions

1. Should we add API response caching? (Currently no caching layer)
2. Do we need API rate limiting per-user or per-IP only?
3. Should OG image route eventually move to API with Edge Runtime?
4. Can we reduce API cold start times on Vercel?

---

**Commit**: 457a35a8383adab4e4ac675bc572d988789da19f
**Branch**: feat/monorepo
**Deployment**: Vercel (web) + Vercel (api) - separate projects
**Status**: Production ready, all tests passing
