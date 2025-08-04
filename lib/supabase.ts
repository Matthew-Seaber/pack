import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPA_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPA_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key not defined in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);