import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { courseName, examBoard, entryID, type, detail } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    if (!courseName || !examBoard) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { data: courseData, error: courseFetchError } =
      await supabaseMainAdmin
        .from("courses")
        .select("course_id")
        .eq("course_name", courseName)
        .eq("exam_board", examBoard)
        .single();

    if (courseFetchError) {
      console.error("Error getting course:", courseFetchError);
      return NextResponse.json(
        { error: "Failed to get course ID" },
        { status: 500 }
      );
    }

    const courseID = courseData.course_id;

    const { data: subjectData, error: subjectFetchError } =
      await supabaseMainAdmin
        .from("subjects")
        .select("subject_id")
        .eq("course_id", courseID)
        .eq("user_id", user.user_id)
        .limit(1)
        .single(); // Limit(1) is used as a fallback if the user has multiple of the same course (which shouldn't occur anyway)

    if (subjectFetchError) {
      console.error("Error getting subject:", subjectFetchError);
      return NextResponse.json(
        { error: "Failed to get subject ID" },
        { status: 500 }
      );
    }

    const subjectID = subjectData.subject_id;

    if (type === "confidence") {
      const { error: confidenceError } = await supabaseMainAdmin
        .from("specification_subject_link")
        .update({ confidence: detail })
        .eq("entry_id", entryID)
        .eq("subject_id", subjectID);

      if (confidenceError) {
        throw confidenceError;
      }
    } else if (type === "sessions") {
      const { data: getSessionsData, error: getSessionsError } =
        await supabaseMainAdmin
          .from("specification_subject_link")
          .select("sessions")
          .eq("entry_id", entryID)
          .eq("subject_id", subjectID)
          .single();

      if (getSessionsError) {
        throw getSessionsError;
      }

      let newSessions;
      if (!getSessionsData) {
        newSessions = 1;
      } else {
        newSessions = getSessionsData.sessions + 1;
      }

      const { error: sessionsError } = await supabaseMainAdmin
        .from("specification_subject_link")
        .update({ sessions: newSessions })
        .eq("entry_id", entryID)
        .eq("subject_id", subjectID);

      if (sessionsError) {
        throw sessionsError;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Successfully amended data",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: `Failed to update subject specification link` },
      { status: 500 }
    );
  }
}
