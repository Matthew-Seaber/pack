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

    const user_id = user.user_id;
    const {
      name,
      description,
      start,
      end,
      type,
      subjectID,
      locationType,
      location,
    } = await req.json();

    // Validate required fields
    if (
      !name ||
      !start ||
      !end ||
      locationType === null ||
      locationType === undefined
    ) {
      return NextResponse.json(
        { error: "Name, start, end, and locationType are required" },
        { status: 400 }
      );
    }

    // Insert the new task into the database
    const { data: calendarData, error: insertError } = await supabaseMainAdmin
      .from("calendar_events")
      .insert({
        user_id: user_id,
        event_name: name,
        event_description: description || null,
        event_start: start,
        event_end: end,
        type: type || null,
        subject_id: subjectID || null,
        location_type: locationType || 0,
        location: location || null,
      })
      .select(
        "event_id, event_name, event_description, event_start, event_end, type, subject_id, location_type, location"
      )
      .single();

    if (insertError) {
      console.error("Error adding calendar event:", insertError);
      return NextResponse.json(
        { error: "Failed to add calendar event" },
        { status: 500 }
      );
    }

    // Returns the created calendar event
    const newEvent = {
      id: calendarData.event_id,
      name: calendarData.event_name,
      description: calendarData.event_description || null,
      event_start: calendarData.event_start,
      event_end: calendarData.event_end,
      type: calendarData.type || "Other",
      subject: calendarData.subject_id || null,
      location_type: calendarData.location_type || null,
      location: calendarData.location || null,
    };

    return NextResponse.json({
      event: newEvent,
      message: "Event successfully added",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
