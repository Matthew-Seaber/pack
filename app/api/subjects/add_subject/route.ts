import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { subjectName, examBoard } = await req.json();

  // Gets user here instead of the client for security
  const user = await getUser();
  let yearGroup = "";

  if (!user) {
    return NextResponse.json({ error: "User not signed in" }, { status: 401 });
  }

  try {
    const { data: studentData, error: studentDataError } =
      await supabaseMainAdmin
        .from("students")
        .select("year_group")
        .eq("user_id", user.user_id)
        .single();

    if (studentDataError) {
      return NextResponse.json(
        {
          message: `Error fetching student data: ${studentDataError.message}`,
        },
        { status: 500 }
      );
    } else if (studentData) {
      yearGroup = studentData.year_group;
    }

    let qualification;
    if (yearGroup == "10" || yearGroup == "11") {
      qualification = "GCSE";
    } else if (yearGroup == "12" || yearGroup == "13") {
      qualification = "A level";
    }

    const { data: courseData, error: getCourseError } = await supabaseMainAdmin
      .from("courses")
      .select("course_id")
      .eq("course_name", subjectName)
      .eq("exam_board", examBoard)
      .eq("qualification", qualification)
      .limit(1)
      .maybeSingle();

    if (getCourseError || !courseData) {
      return NextResponse.json(
        {
          message: `Error fetching course data: ${
            getCourseError?.message ?? "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    const { error: subjectInsertError } = await supabaseMainAdmin
      .from("subjects")
      .insert({ user_id: user.user_id, course_id: courseData.course_id })
      .select();

    if (subjectInsertError) {
      return NextResponse.json(
        {
          message: `Error inserting subject: ${subjectInsertError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Subject added and successfully linked to course." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Error creating student's subjects or linking to courses. It's likely the subject/exam board pair don't exist or aren't yet supported by Pack: ${error}`,
      },
      { status: 500 }
    );
  }
}
