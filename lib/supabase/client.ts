import { createBrowserClient } from "@supabase/ssr";

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-publishable-key";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? fallbackKey,
  );
}
