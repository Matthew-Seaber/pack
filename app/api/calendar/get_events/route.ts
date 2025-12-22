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

    const user_id = user.user_id;
    const user_role = user.role;

    const { data: eventsData, error: fetchError } = await supabaseMainAdmin
      .from("calendar_events")
      .select("event_id, event_name, event_description, event_start, event_end, type, subject_id, location_type, location")
      .eq("user_id", user_id);

    if (fetchError) {
      console.error("Error getting calendar events:", fetchError);
      return NextResponse.json(
        { error: "Failed to get calendar events" },
        { status: 500 }
      );
    }

    type CalendarEvent = {
      event_id: string | number;
      event_name: string;
      event_description: string | null;
      event_start: string;
      event_end: string;
      type: string | null;
      subject_id?: string | null;
      location_type: number | null;
      location?: string | null;
    };

    const events = eventsData.map((event: CalendarEvent) => {
      let final_location_type: string | null = null;
      if (event.location_type === 1) {
        final_location_type = "In-person";
      } else if (event.location_type === 2) {
        final_location_type = "Online";
      } else {
        final_location_type = null;
      }

      return {
        id: event.event_id,
        name: event.event_name,
        description: event.event_description || null,
        start: event.event_start,
        end: event.event_end,
        type: event.type || "Other",
        subject_id: event.subject_id || null,
        location_type: final_location_type || null,
        location: event.location || null,
      };
    });

    if (events.length === 0) {
      return NextResponse.json({
        userRole: user_role,
        events: [],
        message: "No calendar events found",
      });
    }

    return NextResponse.json({ userRole: user_role, events });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
