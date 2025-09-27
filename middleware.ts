import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

// Routes which require user to be logged in
const protectedRoutes = ["/dashboard", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("sessionCookie");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url)); // Redirects to /login if no cookie exists
  }

  try {
    // Verifies session exists in database
    const { data: session, error } = await supabaseMainAdmin
      .from("sessions")
      .select("user_id, expires")
      .eq("token", sessionCookie.value)
      .single();

    if (error || !session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const now = new Date();
    const expiryDate = new Date(session.expires);

    if (now > expiryDate) { // If session has expired
      await supabaseMainAdmin
        .from("sessions")
        .delete()
        .eq("token", sessionCookie.value);

      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sessionCookie");
      return response;
    }

    // Returns if request is valid
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { // Ensures efficient use of middleware - makes sure it doesn't run on the following files/paths
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.css$|.*\\.js$|.*\\.json$).*)",
    ],
};
