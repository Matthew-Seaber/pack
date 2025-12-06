import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const qualification = searchParams.get("qualification");
    const courseName = searchParams.get("subject");
    const examBoard = searchParams.get("examBoard");

    if (!qualification || !courseName || !examBoard) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let newQualification = null;

    if (qualification === "gcse") {
      newQualification = "GCSE";
    } else if (qualification === "a-level") {
      newQualification = "A level";
    } else {
      return NextResponse.json(
        { error: "Unknown qualification type" },
        { status: 400 }
      );
    }

    const { data: courseData, error: courseFetchError } =
      await supabaseMainAdmin
        .from("courses")
        .select("course_id")
        .eq("qualification", newQualification)
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

    // Get resource name, series, QP location, MS location, MA location, IS location for all entries with matching course ID
    const {
      data: pastPaperEntryData,
      error: pastPaperEntryFetchError,
    } = await supabaseMainAdmin
      .from("past_papers")
      .select(
        "paper_id, resource_name, series, question_paper_location, mark_scheme_location, model_answers_location, insert_location"
      )
      .eq("course_id", courseID);

    if (pastPaperEntryFetchError) {
      console.error(
        "Error getting past paper entries:",
        pastPaperEntryFetchError
      );
      return NextResponse.json(
        { error: "Failed to get past paper entries" },
        { status: 500 }
      );
    }

    // Combines data into format of the PastPaperEntry interface
    const pastPaperEntries = pastPaperEntryData.map((entry) => {
      return {
        id: entry.paper_id,
        resource_name: entry.resource_name,
        series: entry.series,
        files: [
          entry.question_paper_location,
          entry.mark_scheme_location,
          entry.model_answers_location,
          entry.insert_location,
        ].filter(Boolean).length, // Counts how many file locations are not null
        question_paper_location: entry.question_paper_location,
        mark_scheme_location: entry.mark_scheme_location,
        model_answers_location: entry.model_answers_location,
        insert_location: entry.insert_location,
      };
    });

    return NextResponse.json({ pastPaperEntries });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
