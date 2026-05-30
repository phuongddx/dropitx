"use client";

import { toast } from "sonner";

/**
 * Show a user-friendly toast when the API returns 429.
 * Auto-dismisses after the retry window (capped at 10 s).
 */
export function showRateLimitToast(retryAfter: number) {
  toast.error("Too many requests", {
    description: `Please wait ${retryAfter} seconds before trying again.`,
    duration: Math.min(retryAfter * 1000, 10_000),
  });
}

/**
 * Wraps any fetch call with automatic 429 detection.
 * Throws a RateLimitError on 429; returns the Response otherwise.
 */
export class RateLimitError extends Error {
  public retryAfter: number;

  constructor(retryAfter: number) {
    super(`Rate limited. Retry after ${retryAfter}s.`);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export async function fetchWithRateLimit(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = parseInt(
      response.headers.get("retry-after") || "60",
      10
    );
    showRateLimitToast(retryAfter);
    throw new RateLimitError(retryAfter);
  }

  return response;
}
