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

    const { data: subjectsData, error: subjectFetchError } =
      await supabaseMainAdmin
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
        message: "No subjects found",
      });
    }

    const courseIDs = subjectsData.map((subject) => subject.course_id);

    // Get course names, exam boards, papers, final year for all course IDs
    const { data: courseData, error: courseFetchError } =
      await supabaseMainAdmin
        .from("courses")
        .select("course_id, course_name, course_description, exam_board, papers, final_year")
        .in("course_id", courseIDs);

    if (courseFetchError) {
      console.error("Error getting courses:", courseFetchError);
      return NextResponse.json(
        { error: "Failed to get courses" },
        { status: 500 }
      );
    }

    // Get exam dates for all course IDs
    const { data: examDatesData, error: examDatesFetchError } =
      await supabaseMainAdmin
        .from("exam_dates")
        .select("course_id, exam_date, type")
        .in("course_id", courseIDs);

    if (examDatesFetchError) {
      console.error("Error getting exam dates:", examDatesFetchError);
      return NextResponse.json(
        { error: "Failed to get exam dates" },
        { status: 500 }
      );
    }

    // Group exam dates by course_id
    const examDatesByCourse = new Map<number, Array<{ examDate: string; type: string }>>();
    examDatesData?.forEach((exam) => {
      const dates = examDatesByCourse.get(exam.course_id) || [];
      dates.push({ examDate: exam.exam_date, type: exam.type });
      examDatesByCourse.set(exam.course_id, dates);
    });

    // Create course lookup map for faster access
    const courseMap = new Map(
      courseData?.map((course) => [course.course_id, course])
    );

    // Combines subject_id with course info and their exam dates
    const subjects = subjectsData.map((subject) => {
      const course = courseMap.get(subject.course_id);

      return {
        id: subject.subject_id,
        name: course?.course_name || "Course name error",
        description: course?.course_description || "",
        examBoard: course?.exam_board || "",
        papers: course?.papers || "",
        examDates: examDatesByCourse.get(subject.course_id) || [],
      };
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
