import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient stores the session in cookies (chunked + base64) that
// are shared across tabs and readable by the server client / middleware.
// Do not pass a custom `auth.storage` — @supabase/ssr ignores it and it
// masks the real cookie handling.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
