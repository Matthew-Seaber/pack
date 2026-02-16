import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { newState } = await req.json();
  let isEnabled = null;

  // Gets user here instead of the client for security
  const user = await getUser();

  if (!user || !newState)
    return NextResponse.json({ ok: false }, { status: 400 });

  if (newState === "Enabled") {
    isEnabled = true;
  } else if (newState === "Disabled") {
    isEnabled = false;
  }

  const { error } = await supabaseMainAdmin
    .from("students")
    .update({ progress_emails: isEnabled })
    .eq("user_id", user.user_id);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
