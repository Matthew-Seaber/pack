import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const { userID, newEmail } = await req.json();

  if (!userID || !newEmail)
    return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabaseMainAdmin
    .from("users")
    .update({ email: newEmail })
    .eq("user_id", userID);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true });
}
