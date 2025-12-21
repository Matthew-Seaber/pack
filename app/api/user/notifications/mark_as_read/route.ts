import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { notificationIDs } = await req.json();

    if (!notificationIDs || notificationIDs.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const { error: notificationUpdateError } = await supabaseMainAdmin
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.user_id)
      .in("notification_id", notificationIDs);

    if (notificationUpdateError) {
      console.error("Error updating notifications:", notificationUpdateError);
      return NextResponse.json(
        { error: "Failed to update notifications" },
        { status: 500 }
      );
    } else {
      return NextResponse.json({
        message: "Successfully amended notification data",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error, ${error}` },
      { status: 500 }
    );
  }
}
