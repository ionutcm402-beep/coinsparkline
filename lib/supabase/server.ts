import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-publishable-key";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? fallbackKey,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
