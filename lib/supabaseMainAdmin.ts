import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPA_URL!;
const supabaseServiceRoleKey = process.env.SUPA_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase URL or Service Role Key not defined in environment variables."
  );
}

export const supabaseMainAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);
