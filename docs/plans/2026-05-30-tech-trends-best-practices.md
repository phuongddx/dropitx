# DropItX — Technology Trends & Best Practices Upgrade Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Upgrade DropItX frontend + backend with 2026 technology trends and 5 best practices.

**Architecture:** Apply modern patterns across both Next.js 16 frontend and FastAPI backend — security headers, structured logging, error boundaries, caching, and observability.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, FastAPI, Supabase, Pydantic v2

---

## 📊 Current State Analysis

### Frontend (dropitx)
- Next.js 16.2.4 + React 19 + Tailwind v4
- Supabase SSR auth (cookie-based)
- CodeMirror editor, Markdown viewer, team collaboration
- Recharts analytics, shadcn/ui components
- **Missing:** Security headers, error boundaries, PWA, structured logging, API type safety

### Backend (dropitx-be)
- FastAPI + Supabase (Postgres + Storage)
- JWT auth via JWKS, API key auth, rate limiting
- Team management, document CRUD, analytics tracking
- **Missing:** Structured logging, health checks, caching, CORS hardening, request middleware

---

## 🔥 5 Best Practices to Apply

1. **🛡️ Security Headers** — CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
2. **📝 Structured Logging** — JSON logging for production, request ID tracking
3. **⚡ Error Boundaries** — React error boundaries + FastAPI exception handlers
4. **🔄 Caching Strategy** — Cache-Control headers, stale-while-revalidate, backend response caching
5. **📊 Observability** — Request/response middleware, health dependency checks, performance tracking

---

## Task List

### Phase 1: Backend Best Practices (dropitx-be)

---

### Task 1: Add Structured JSON Logging

**Objective:** Replace default Python logging with structured JSON for production observability.

**Files:**
- Create: `core/logging_config.py`
- Modify: `app/main.py`

**Step 1: Create logging config module**

```python
# core/logging_config.py
"""Structured JSON logging for production."""

import json
import logging
import sys
from datetime import datetime, timezone
from contextvars import ContextVar

# Request ID context variable
request_id_var: ContextVar[str] = ContextVar("request_id", default="")

class JSONFormatter(logging.Formatter):
    """Emit log records as JSON lines."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        request_id = request_id_var.get("")
        if request_id:
            log_entry["request_id"] = request_id

        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Include extra fields
        for key in ("status_code", "method", "path", "duration_ms", "client_ip"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging(level: str = "INFO", json_format: bool = True) -> None:
    """Configure application logging.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR)
        json_format: If True, use JSON formatting (for production)
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if json_format:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        ))

    root.addHandler(handler)

    # Suppress noisy loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
```

**Step 2: Integrate in main.py**

Add at top of `app/main.py`:
```python
from core.logging_config import setup_logging
import os

# Setup structured logging
setup_logging(
    level=os.getenv("LOG_LEVEL", "INFO"),
    json_format=os.getenv("ENV", "production") == "production",
)
```

**Step 3: Verify**

```bash
cd /Users/ddx-pro17/Projects/dropitx-be
python -c "from core.logging_config import setup_logging; setup_logging(json_format=True); import logging; logging.getLogger('test').info('hello structured')"
```
Expected: JSON line output with timestamp, level, logger, message.

---

### Task 2: Add Request ID Middleware

**Objective:** Track requests end-to-end with unique IDs for debugging.

**Files:**
- Create: `core/middleware.py`
- Modify: `app/main.py`

**Step 1: Create middleware module**

```python
# core/middleware.py
"""Request tracking and timing middleware."""

import time
import uuid
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from core.logging_config import request_id_var

logger = logging.getLogger(__name__)


class RequestTrackingMiddleware(BaseHTTPMiddleware):
    """Add request ID and timing to every request."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate or extract request ID
        req_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
        request_id_var.set(req_id)

        # Track timing
        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            logger.error("Unhandled exception", exc_info=True)
            raise

        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        # Log request
        logger.info(
            "%s %s → %s (%sms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_ip": request.headers.get(
                    "x-forwarded-for", ""
                ).split(",")[0].strip() or (request.client.host if request.client else ""),
            },
        )

        # Add tracking headers to response
        response.headers["x-request-id"] = req_id
        response.headers["x-response-time"] = f"{duration_ms}ms"

        return response
```

**Step 2: Register middleware in main.py**

```python
from core.middleware import RequestTrackingMiddleware

# After CORS middleware
app.add_middleware(RequestTrackingMiddleware)
```

**Step 3: Verify**

```bash
uvicorn app.main:app --reload
curl -i http://localhost:8000/health
```
Expected: Response headers include `x-request-id` and `x-response-time`.

---

### Task 3: Add Security Headers Middleware

**Objective:** Apply industry-standard security headers to all responses.

**Files:**
- Modify: `core/middleware.py` (add SecurityHeadersMiddleware)
- Modify: `app/main.py`

**Step 1: Add SecurityHeadersMiddleware**

Append to `core/middleware.py`:

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply security headers to all responses."""

    HEADERS = {
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "x-xss-protection": "1; mode=block",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=(), microphone=(), geolocation=()",
        "strict-transport-security": "max-age=31536000; includeSubDomains",
    }

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for key, value in self.HEADERS.items():
            response.headers[key] = value
        return response
```

**Step 2: Register in main.py**

```python
from core.middleware import SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)
```

**Step 3: Verify**

```bash
curl -sI http://localhost:8000/health | grep -i "x-content-type\|x-frame\|strict-transport"
```
Expected: All security headers present.

---

### Task 4: Add Dependency Health Check

**Objective:** Deep health check that verifies Supabase connectivity.

**Files:**
- Modify: `app/main.py`

**Step 1: Enhance health endpoint**

Replace the existing health check in `app/main.py`:

```python
from fastapi import APIRouter
import asyncio
from core.supabase import get_admin_client

health_router = APIRouter(tags=["Health"])


@health_router.get("/health")
async def health_check():
    """Basic health check — always returns ok if process is alive."""
    return {"status": "ok", "service": "dropitx-api"}


@health_router.get("/health/deep")
async def deep_health_check():
    """Deep health check — verifies database connectivity."""
    checks = {}
    healthy = True

    # Check Supabase Postgres
    try:
        client = get_admin_client()
        start = time.perf_counter()
        await asyncio.to_thread(
            lambda: client.table("shares").select("id").limit(1).execute()
        )
        checks["database"] = {
            "status": "ok",
            "latency_ms": round((time.perf_counter() - start) * 1000, 1),
        }
    except Exception as e:
        checks["database"] = {"status": "error", "error": str(e)}
        healthy = False

    return {
        "status": "ok" if healthy else "degraded",
        "checks": checks,
        "service": "dropitx-api",
    }
```

Register in main.py:
```python
app.include_router(health_router)
```

**Step 2: Verify**

```bash
curl http://localhost:8000/health/deep
```
Expected: JSON with database check status and latency.

---

### Task 5: Add Response Caching Headers

**Objective:** Apply Cache-Control headers for public shares and static content.

**Files:**
- Modify: `app/public/shares.py`
- Modify: `app/public/search.py`
- Modify: `app/public/oembed.py`

**Step 1: Add cache headers to public share endpoint**

In `app/public/shares.py`, add to the share retrieval endpoint:

```python
from fastapi.responses import JSONResponse

# After fetching share data, wrap response with cache headers
response = JSONResponse(content=share_data)
response.headers["cache-control"] = "public, max-age=60, stale-while-revalidate=300"
response.headers["cdn-cache-control"] = "max-age=60"
return response
```

**Step 2: Add cache headers to search**

In `app/public/search.py`:
```python
response.headers["cache-control"] = "public, max-age=30, stale-while-revalidate=60"
```

**Step 3: Add cache headers to oEmbed**

In `app/public/oembed.py`:
```python
response.headers["cache-control"] = "public, max-age=3600"
```

---

### Task 6: Add Global Exception Handler

**Objective:** Consistent error response format across all endpoints.

**Files:**
- Create: `core/exceptions.py`
- Modify: `app/main.py`

**Step 1: Create exception module**

```python
# core/exceptions.py
"""Custom exceptions and error response models."""

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: str
    detail: str | None = None
    request_id: str | None = None


class RateLimitError(Exception):
    """Raised when rate limit is exceeded."""
    def __init__(self, retry_after: int = 60):
        self.retry_after = retry_after


class ShareNotFoundError(Exception):
    """Raised when a share is not found."""
    pass


class SharePasswordRequired(Exception):
    """Raised when a password-protected share needs unlock."""
    pass
```

**Step 2: Register handlers in main.py**

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from core.exceptions import ErrorResponse, RateLimitError, ShareNotFoundError
from core.logging_config import request_id_var

@app.exception_handler(RateLimitError)
async def rate_limit_handler(request: Request, exc: RateLimitError):
    return JSONResponse(
        status_code=429,
        content=ErrorResponse(
            error="rate_limit_exceeded",
            detail=f"Too many requests. Retry after {exc.retry_after}s.",
            request_id=request_id_var.get(""),
        ).model_dump(),
        headers={"retry-after": str(exc.retry_after)},
    )

@app.exception_handler(ShareNotFoundError)
async def share_not_found_handler(request: Request, exc: ShareNotFoundError):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error="not_found",
            detail="Share not found",
            request_id=request_id_var.get(""),
        ).model_dump(),
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="internal_error",
            detail="An unexpected error occurred",
            request_id=request_id_var.get(""),
        ).model_dump(),
    )
```

---

### Phase 2: Frontend Best Practices (dropitx)

---

### Task 7: Add Security Headers via Next.js Middleware

**Objective:** Apply security headers at the edge before responses reach clients.

**Files:**
- Create: `middleware.ts` (root level)

**Step 1: Create Next.js middleware**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "1; mode=block",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "strict-transport-security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and api/og-image
    "/((?!_next/static|_next/image|favicon.ico|api/og-image).*)",
  ],
};
```

**Step 2: Verify**

```bash
cd /Users/ddx-pro17/Projects/dropitx
npm run dev
curl -sI http://localhost:3000 | grep -i "x-content-type\|x-frame"
```

---

### Task 8: Add Global Error Boundary

**Objective:** Catch React rendering errors gracefully with a user-friendly fallback.

**Files:**
- Create: `components/error-boundary.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create error boundary component**

```tsx
// components/error-boundary.tsx
"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Wrap app in layout.tsx**

In `app/layout.tsx`, wrap children with ErrorBoundary:

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

// In the body:
<body>
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</body>
```

---

### Task 9: Add Loading States with Suspense Boundaries

**Objective:** Improve perceived performance with streaming SSR and skeleton loaders.

**Files:**
- Create: `app/(dashboard)/dashboard/loading.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Create dashboard loading skeleton**

```tsx
// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
```

**Step 2: Add Suspense to dashboard page**

```tsx
// In app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Wrap async data fetching components with Suspense
<Suspense fallback={<DashboardSkeleton />}>
  <RecentShares />
</Suspense>
```

---

### Task 10: Add API Response Type Safety

**Objective:** Generate TypeScript types from FastAPI OpenAPI spec for type-safe API calls.

**Files:**
- Create: `scripts/generate-api-types.sh`
- Create: `lib/api-types.ts` (generated)

**Step 1: Create generation script**

```bash
#!/bin/bash
# scripts/generate-api-types.sh
# Generate TypeScript types from FastAPI OpenAPI spec

set -euo pipefail

API_URL="${API_URL:-http://localhost:8000}"
OUTPUT="lib/api-types.ts"

echo "Fetching OpenAPI spec from ${API_URL}/openapi.json..."

# Fetch and convert to TypeScript
npx openapi-typescript "${API_URL}/openapi.json" -o "${OUTPUT}"

echo "Generated ${OUTPUT}"
```

**Step 2: Add to package.json scripts**

```json
{
  "scripts": {
    "generate-types": "bash scripts/generate-api-types.sh"
  }
}
```

**Step 3: Use in API client**

```typescript
// lib/api-client.ts — use generated types
import type { paths } from "@/lib/api-types";

type ShareResponse = paths["/api/shares/{slug}"]["get"]["responses"]["200"]["content"]["application/json"];
```

---

### Task 11: Add Rate Limit Feedback to UI

**Objective:** Show users when they're being rate-limited with helpful messaging.

**Files:**
- Modify: `lib/api-client.ts`
- Create: `components/rate-limit-toast.tsx`

**Step 1: Enhance API client error handling**

```typescript
// lib/api-client.ts — add rate limit detection
export async function authFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    throw new RateLimitError(
      parseInt(retryAfter || "60", 10)
    );
  }

  // ... existing logic
}

class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limited. Retry after ${retryAfter}s.`);
    this.name = "RateLimitError";
  }
}
```

**Step 2: Create toast component**

```tsx
// components/rate-limit-toast.tsx
"use client";

import { toast } from "sonner";
import { Clock } from "lucide-react";

export function showRateLimitToast(retryAfter: number) {
  toast.error("Too many requests", {
    description: `Please wait ${retryAfter} seconds before trying again.`,
    icon: <Clock className="h-4 w-4" />,
    duration: Math.min(retryAfter * 1000, 10000),
  });
}
```

---

## Execution Order

```
Phase 1 (Backend):
  Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

Phase 2 (Frontend):
  Task 7 → Task 8 → Task 9 → Task 10 → Task 11
```

## Summary

| # | Task | Best Practice | Impact |
|---|------|---------------|--------|
| 1 | Structured Logging | 📝 Observability | Production debugging |
| 2 | Request ID Tracking | 📝 Observability | End-to-end tracing |
| 3 | Security Headers (BE) | 🛡️ Security | Attack surface reduction |
| 4 | Deep Health Check | 📊 Observability | Dependency monitoring |
| 5 | Response Caching | ⚡ Performance | Reduced load, faster responses |
| 6 | Global Exception Handler | ⚡ Error Handling | Consistent API errors |
| 7 | Security Headers (FE) | 🛡️ Security | Client-side protection |
| 8 | Error Boundary | ⚡ Error Handling | Graceful degradation |
| 9 | Suspense Boundaries | ⚡ Performance | Better perceived performance |
| 10 | API Type Safety | 🔄 DX | Fewer runtime errors |
| 11 | Rate Limit Feedback | 📊 UX | Better user experience |
