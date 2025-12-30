import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function PUT(req: Request) { // PUT request used rather than POST because PUT is idempotent (calling it once or several times has the same effect)
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
      id,
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
      !id ||
      !name ||
      !start ||
      !end ||
      locationType === null ||
      locationType === undefined
    ) {
      return NextResponse.json(
        { error: "ID, name, start, end, and locationType are required" },
        { status: 400 }
      );
    }

    let finalLocation = 0;

    if (locationType === "In-person") {
      finalLocation = 1;
    } else if (locationType === "Virtual") {
      finalLocation = 2;
    } else {
      finalLocation = 0;
    }

    // Updates the event in the database
    const { data: calendarData, error: updateError } = await supabaseMainAdmin
      .from("calendar_events")
      .update({
        event_name: name,
        event_description: description || null,
        event_start: start,
        event_end: end,
        type: type || null,
        subject_id: subjectID || null,
        location_type: finalLocation,
        location: location || null,
      })
      .eq("event_id", id)
      .eq("user_id", user_id) // Ensures the user calling the API has permission to amend the event
      .select(
        "event_id, event_name, event_description, event_start, event_end, type, subject_id, location_type, location"
      )
      .single();

    if (updateError) {
      console.error("Error updating calendar event:", updateError);
      return NextResponse.json(
        { error: "Failed to update calendar event" },
        { status: 500 }
      );
    }

    // Returns the updated calendar event
    const updatedEvent = {
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
      event: updatedEvent,
      message: "Event successfully amended",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
