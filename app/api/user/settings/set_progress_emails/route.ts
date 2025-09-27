import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const { userID, newState } = await req.json();
  let isEnabled = null;

  if (!userID || !newState)
    return NextResponse.json({ ok: false }, { status: 400 });

  if (newState === "Enabled") {
    isEnabled = true;
  } else if (newState === "Disabled") {
    isEnabled = false;
  }

  const { error } = await supabaseMainAdmin
    .from("students")
    .update({ progress_emails: isEnabled })
    .eq("user_id", userID);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true });
}
