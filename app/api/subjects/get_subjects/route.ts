import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "User not signed in" }, { status: 401 });
    }

    const user_id = user.user_id;

    const { data: subjectsData, error: subjectFetchError } = await supabaseMainAdmin
      .from("subjects")
      .select("subject_id, course_id")
      .eq("user_id", user_id);

    if (subjectFetchError) {
      console.error("Error getting subjects:", subjectFetchError);
      return NextResponse.json(
        { error: "Failed to get subjects" },
        { status: 500 }
      );
    }

    if (!subjectsData || subjectsData.length === 0) {
      return NextResponse.json({
        subjects: [],
        message: "No subjects found"
      });
    }

    const courseIds = subjectsData.map(subject => subject.course_id);

    // Get course names for all course IDs
    const { data: courseData, error: courseFetchError } = await supabaseMainAdmin
      .from("courses")
      .select("course_id, course_name")
      .in("course_id", courseIds);

    if (courseFetchError) {
      console.error("Error getting courses:", courseFetchError);
      return NextResponse.json(
        { error: "Failed to get courses" },
        { status: 500 }
      );
    }

    const courseMap = new Map(
      courseData?.map(course => [course.course_id, course.course_name]) || []
    );

    // Combines subject_id with course_name to return
    const subjects = subjectsData.map((subject) => ({
      id: subject.subject_id,
      name: courseMap.get(subject.course_id) || "Course name error",
    }));

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}