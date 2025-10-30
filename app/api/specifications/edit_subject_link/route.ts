import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const debugInfo = []; // Using Postman to debug API

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
      const { data: confidenceData, error: confidenceError } =
        await supabaseMainAdmin
          .from("specification_subject_link")
          .update({ confidence: detail })
          .eq("entry_id", entryID)
          .eq("subject_id", subjectID)
          .select();

      debugInfo.push("Confidence data:", confidenceData);
      debugInfo.push("Confidence error (if applicable):", confidenceError);

      if (confidenceError) {
        throw confidenceError;
      }

      if (!confidenceData || confidenceData.length === 0) {
        return NextResponse.json(
          { error: "No matching specification entry found" },
          { status: 404 }
        );
      }
    } else if (type === "sessions") {
      const { data: getSessionsData, error: getSessionsError } =
        await supabaseMainAdmin
          .from("specification_subject_link")
          .select("sessions")
          .eq("entry_id", entryID)
          .eq("subject_id", subjectID)
          .single();

      debugInfo.push("Get sessions data:", getSessionsData);
      debugInfo.push("Get sessions error (if applicable):", getSessionsError);

      if (getSessionsError) {
        throw getSessionsError;
      }

      let newSessions;
      if (!getSessionsData) {
        newSessions = 1;
      } else {
        newSessions = getSessionsData.sessions + 1;
      }

      const { data: sessionsData, error: sessionsError } =
        await supabaseMainAdmin
          .from("specification_subject_link")
          .update({ sessions: newSessions })
          .eq("entry_id", entryID)
          .eq("subject_id", subjectID)
          .select();

      debugInfo.push("Sessions data:", sessionsData);
      debugInfo.push("Sessions error (if applicable):", sessionsError);

      if (sessionsError) {
        throw sessionsError;
      }

      if (!sessionsData || sessionsData.length === 0) {
        return NextResponse.json(
          { error: "No matching specification entry found" },
          { status: 404 }
        );
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
    return NextResponse.json(
      {
        message: `Failed to update subject specification link: ${
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error, Object.getOwnPropertyNames(error)) ||
              String(error)
        }`,
        errorDetails: error,
      },
      { status: 500 }
    );
  }
}
