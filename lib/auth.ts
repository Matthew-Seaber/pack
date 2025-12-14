import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function getUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionCookie");

  if (!sessionCookie) {
    return null;
  }

  try {
    // Single query joining 'sessions' and 'users' tables to avoid 2 consecutive queries which previously led to slow responses, negatively affecting UX
    const { data: sessionData, error: sessionError } = await supabaseMainAdmin
      .from("sessions")
      .select(
        `
        user_id,
        expires,
        users!inner (
          user_id,
          username,
          email,
          first_name,
          role,
          created_at,
          last_login
        )
      `
      )
      .eq("token", sessionCookie.value)
      .single();

    if (sessionError || !sessionData) {
      return null;
    }

    // Check if session has expired
    const now = new Date();
    const expiryDate = new Date(sessionData.expires);

    if (now > expiryDate) {
      // Delete session if it has expired
      await supabaseMainAdmin
        .from("sessions")
        .delete()
        .eq("token", sessionCookie.value);
      return null;
    }

    // Extract user data from the join
    const userData = sessionData.users;
    
    if (!userData) {
      return null;
    }

    const user = Array.isArray(userData) ? userData[0] : userData;

    if (!user || !user.user_id) {
      return null;
    }

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      role: user.role,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionCookie");

  // Delete session from database
  if (sessionCookie) {
    try {
      await supabaseMainAdmin
        .from("sessions")
        .delete()
        .eq("token", sessionCookie.value);
    } catch (error) {
      console.error("Error deleting session from database:", error);
    }
  }

  // Clears cache (required for role-based navbar)
  revalidatePath("/", "layout");

  // Clear the session cookie
  cookieStore.set({
    name: "sessionCookie",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}
