import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() { // Gets core user data
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "User not signed in" }, { status: 401 });
    }

    return NextResponse.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      role: user.role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error getting user data ${error}` },
      { status: 500 }
    );
  }
}
