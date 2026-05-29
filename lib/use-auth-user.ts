"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Cross-tab auth state sync hook.
 *
 * Returns the current user (or null). Uses Supabase's onAuthStateChange
 * + BroadcastChannel to sync login/logout across tabs instantly.
 */
export function useAuthUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null,
  );

  const supabase = createClient();

  // Fetch initial user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // Listen for auth state changes (fires on login/logout/token refresh)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cross-tab sync via BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel("supabase-auth-sync");

    channel.onmessage = (event) => {
      if (event.data === "SIGNED_IN" || event.data === "SIGNED_OUT") {
        supabase.auth.getUser().then(({ data }) => {
          setUser(data.user ?? null);
        });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        channel.postMessage(event);
      }
    });

    return () => {
      subscription.unsubscribe();
      channel.close();
    };
  }, []);

  return user;
}
