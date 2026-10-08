import { createClient } from "@supabase/supabase-js";
import { requireSupabase } from "./config.js";

/**
 * Server-side Supabase client.
 *
 * The service-role key never leaves this process: the browser only ever sees
 * the generated registry and the JSON API below.
 */
export function createSupabase(config) {
  requireSupabase(config);
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
