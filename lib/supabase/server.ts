import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

// Server component / server action client.
// NOTE: in a Server Component, cookies().set() will throw because Next.js
// disallows mutating cookies outside of a Server Action / Route Handler.
// The middleware handles refreshing the session, so we swallow that error here.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}
