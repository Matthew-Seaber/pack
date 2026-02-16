import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  // Gets user here instead of the client for security
  const user = await getUser();

  const { newEmail } = await req.json();

  if (!user || !newEmail) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  
  const userID = user.user_id;

  const { error } = await supabaseMainAdmin
    .from("users")
    .update({ email: newEmail })
    .eq("user_id", userID);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
