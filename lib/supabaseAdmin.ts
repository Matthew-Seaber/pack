import { createClient } from "@supabase/supabase-js";

const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPA_ADMIN_URL!;
const supabaseAdminKey = process.env.NEXT_PUBLIC_SUPA_ADMIN_ANON_KEY!;

if (!supabaseAdminUrl || !supabaseAdminKey) {
  throw new Error("Supabase Admin URL or Key not defined in environment variables.");
}

export const supabaseAdmin = createClient(supabaseAdminUrl, supabaseAdminKey);