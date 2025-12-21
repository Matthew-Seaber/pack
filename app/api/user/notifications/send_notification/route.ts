import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const { recipients, message } = await req.json();

    // Validate required fields
    if (!recipients || !message) {
      return NextResponse.json(
        {
          error: "Recipients and message are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          error: "Recipients must be a populated array",
        },
        { status: 400 }
      );
    }

    // Create notification objects for each recipient
    const notifications = recipients.map((userID) => ({
      user_id: userID,
      message: message,
    }));

    // Insert all notifications at once
    const { error: insertError } = await supabaseMainAdmin
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Error sending notification:", insertError);
      return NextResponse.json(
        { error: "Failed to send notification, " + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Notification successfully sent",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
