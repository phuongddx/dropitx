"use client";

import { useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/api-client";

interface BurnAfterReadingTrackerProps {
  slug: string;
}

/**
 * Sends a burn API call after the user has viewed the content for a few seconds.
 * This ensures the content was actually seen before being destroyed.
 */
export function BurnAfterReadingTracker({ slug }: BurnAfterReadingTrackerProps) {
  const hasBurned = useRef(false);

  useEffect(() => {
    if (hasBurned.current) return;

    // Wait 3 seconds to ensure user actually saw the content
    const timer = setTimeout(async () => {
      if (hasBurned.current) return;
      hasBurned.current = true;

      try {
        await fetch(getApiUrl(`/api/shares/${slug}/burn`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Burn failed — server-side TTL should handle cleanup
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
