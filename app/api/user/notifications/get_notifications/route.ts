import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const { data: notificationData, error: notificationFetchError } =
      await supabaseMainAdmin
        .from("notifications")
        .select("notification_id, message, time_sent, read")
        .eq("user_id", user.user_id);

    if (notificationFetchError) {
      console.error("Error getting notifications:", notificationFetchError);
      return NextResponse.json(
        { error: "Failed to get notifications" },
        { status: 500 }
      );
    }

    const formattedNotifications = (notificationData || []).map( // Changes into the format of the Notification interface
      (notification) => ({
        id: notification.notification_id?.toString() ?? "",
        message: notification.message,
        sent: notification.time_sent,
        read: notification.read,
      })
    );

    // Split into new and read notifications
    const newNotifications = formattedNotifications.filter((notif) => notif.read === false);
    const readNotifications = formattedNotifications.filter((notif) => notif.read === true);

    return NextResponse.json({ newNotifications, readNotifications });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
