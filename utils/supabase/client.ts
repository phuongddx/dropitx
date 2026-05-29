import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        // Use cookies for storage — shared across tabs automatically
        storage: {
          getItem: (key: string) => {
            if (typeof document === "undefined") return null;
            const match = document.cookie.match(
              new RegExp("(^| )" + key + "=([^;]+)"),
            );
            return match ? decodeURIComponent(match[2]) : null;
          },
          setItem: (key: string, value: string) => {
            if (typeof document === "undefined") return;
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax; secure=${window.location.protocol === "https:"}`;
          },
          removeItem: (key: string) => {
            if (typeof document === "undefined") return;
            document.cookie = `${key}=; path=/; max-age=0`;
          },
        },
        // Detect session from URL (for OAuth redirects)
        detectSessionInUrl: true,
        // Persist session across page loads
        persistSession: true,
        // Auto refresh token before expiry
        autoRefreshToken: true,
      },
    },
  );
