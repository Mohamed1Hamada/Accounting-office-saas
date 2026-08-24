import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase env vars are missing. Check .env.local");
  }

  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
