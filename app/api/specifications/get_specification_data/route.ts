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

    // Get entry topic, name, description, paper, rarity, difficulty for all entries with matching course ID
    const {
      data: specificationEntryData,
      error: specificationEntryFetchError,
    } = await supabaseMainAdmin
      .from("specification_entries")
      .select(
        "entry_id, topic, topic_name, description, paper, common, difficult"
      )
      .eq("course_id", courseID);

    if (specificationEntryFetchError) {
      console.error(
        "Error getting specification entries:",
        specificationEntryFetchError
      );
      return NextResponse.json(
        { error: "Failed to get specification entries" },
        { status: 500 }
      );
    }

    const entryIDs = specificationEntryData.map((entry) => entry.entry_id);

    // Get confidence, sessions for all entry IDs
    const { data: subjectLinkData, error: subjectLinkFetchError } =
      await supabaseMainAdmin
        .from("specification_subject_link")
        .select("entry_id, confidence, sessions")
        .in("entry_id", entryIDs)
        .eq("subject_id", subjectID);

    if (subjectLinkFetchError) {
      console.error("Error getting subject links:", subjectLinkFetchError);
      return NextResponse.json(
        { error: "Failed to get subject links" },
        { status: 500 }
      );
    }

    // Maps entry_id to subject link data
    const subjectLinkMap = new Map(
      subjectLinkData.map((link) => [link.entry_id, link])
    );

    // Combines data into format of the SpecificationEntry interface
    const specificationEntries = specificationEntryData.map((entry) => {
      const linkData = subjectLinkMap.get(entry.entry_id);
      return {
        id: entry.entry_id,
        topic: entry.topic,
        topic_name: entry.topic_name,
        description: entry.description,
        paper: entry.paper,
        common: entry.common,
        difficult: entry.difficult,
        confidence: linkData?.confidence ?? 0,
        sessions: linkData?.sessions ?? 0,
      };
    });

    return NextResponse.json({ specificationEntries });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
