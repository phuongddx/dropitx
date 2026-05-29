"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Solution 2: Cross-tab sync via storage event.
 *
 * Simpler approach — uses the native 'storage' event which fires
 * when localStorage changes in another tab. Works in all browsers.
 */
export function useAuthUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null,
  );

  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // Listen for auth state changes in THIS tab
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Listen for storage changes from OTHER tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("sb-") && e.key.endsWith("-auth-token")) {
        // Supabase session token changed in another tab
        supabase.auth.getUser().then(({ data }) => {
          setUser(data.user ?? null);
        });
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return user;
}
