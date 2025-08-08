import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("sessionCookie");

  // Deletes session from database
  if (sessionCookie) {
    await supabaseMainAdmin
      .from("sessions")
      .delete()
      .eq("token", sessionCookie.value);
  }

  // Clears the session cookie
  const response = NextResponse.json({
    message: "Successfully logged out user",
  });
  response.cookies.set({
    name: "sessionCookie",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
