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

    const { data: primarySchoolworkData, error: primarySchoolworkDataError } =
      await supabaseMainAdmin
        .from("schoolwork")
        .select(
          `schoolwork_id, type, completed, due, issued, schoolwork_name, schoolwork_description, subjects!subject_id(teacher_name,
            courses!course_id(
              course_name
        ))`
        )
        .eq("user_id", user.user_id);

    if (primarySchoolworkDataError) {
      console.error("Error getting schoolwork:", primarySchoolworkDataError);
      return NextResponse.json(
        { error: "Failed to get main schoolwork data" },
        { status: 500 }
      );
    }

    const { data: schoolworkLinkData, error: schoolworkLinkDataError } =
      await supabaseMainAdmin
        .from("schoolwork_student_link")
        .select("class_schoolwork_id, completed")
        .eq("student_id", user.user_id);

    if (schoolworkLinkDataError) {
      console.error(
        "Error getting schoolwork link data:",
        schoolworkLinkDataError
      );
      return NextResponse.json(
        { error: "Failed to get schoolwork link data" },
        { status: 500 }
      );
    }

    if (!schoolworkLinkData || schoolworkLinkData.length === 0) {
      // Format student schoolwork entries
      const studentSchoolworkEntries = primarySchoolworkData.map(
        (entry) => {
          const courseName = entry.subjects?.courses?.course_name || null;
          const teacherName = entry.subjects?.teacher_name || null;
          return {
            id: entry.schoolwork_id.toString(),
            category: 1,
            schoolworkType: entry.type === 1 ? "Homework" : "Test",
            completed: entry.completed,
            due: entry.due,
            issued: entry.issued,
            name: entry.schoolwork_name,
            description: entry.schoolwork_description,
            class_name: null,
            teacher_name: teacherName,
            subject_name: courseName,
          };
        }
      );

      return NextResponse.json({ schoolwork: studentSchoolworkEntries });
    }

    // Extracts class_schoolwork_ids and creates a map for entries' completed statuses (to be used later when returning entries)
    const classSchoolworkIDs = schoolworkLinkData.map(
      (link) => link.class_schoolwork_id
    );
    const completedStatusMap = new Map(
      schoolworkLinkData.map((link) => [
        link.class_schoolwork_id,
        link.completed,
      ])
    );

    // Fetch class_schoolwork with a triple join to 'classes', 'teachers', and 'courses' tables (saves multiple DB calls))
    const { data: teacherSchoolworkData, error: teacherSchoolworkDataError } =
      await supabaseMainAdmin
        .from("class_schoolwork")
        .select(
          `
          class_schoolwork_id,
          type,
          due,
          issued,
          schoolwork_name,
          schoolwork_description,
          course_id,
          classes!class_id(
            class_name,
            teachers!teacher_id(
              title,
              surname,
              subject
            )
          )
          `
        )
        .in("class_schoolwork_id", classSchoolworkIDs);

    if (teacherSchoolworkDataError) {
      console.error(
        "Error getting teacher schoolwork data:",
        teacherSchoolworkDataError
      );
      return NextResponse.json(
        { error: "Failed to get teacher schoolwork data" },
        { status: 500 }
      );
    }

    // Format student-managed schoolwork entries
    const studentSchoolworkEntries = primarySchoolworkData.map((entry) => {
      const teacherName = entry.subjects?.teacher_name || null;
      const courseName = entry.subjects?.courses?.course_name || null;

      return {
        id: entry.schoolwork_id.toString(),
        category: 1, // Student-managed schoolwork
        schoolworkType: entry.type === 1 ? "Homework" : "Test",
        completed: entry.completed,
        due: entry.due,
        issued: entry.issued,
        name: entry.schoolwork_name,
        description: entry.schoolwork_description,
        class_name: null as string | null,
        teacher_name: teacherName,
        subject_name: courseName,
      };
    });

    type TeacherSchoolworkEntry = {
      class_schoolwork_id: number | string;
      type: number | null;
      due: string | null;
      issued: string | null;
      schoolwork_name: string | null;
      schoolwork_description: string | null;
      course_id: number | string | null;
      classes: {
        class_name?: string | null;
        teacher_id?: number | null;
        teachers: {
          title?: string | null;
          surname?: string | null;
          subject?: string | null;
        };
      };
    };

    // Format teacher-managed schoolwork entries with joined data
    const teacherSchoolworkEntries = (teacherSchoolworkData || []).map(
      (entry: TeacherSchoolworkEntry) => {
        const classData = entry.classes;
        const teacherData = classData?.teachers;
        const teacherName =
          teacherData?.title && teacherData?.surname
            ? `${teacherData.title} ${teacherData.surname}`
            : null;
        const teacherSubject = teacherData?.subject || null;

        return {
          id: entry.class_schoolwork_id.toString(),
          category: 2, // Teacher-managed schoolwork
          schoolworkType: entry.type === 1 ? "Homework" : "Test",
          completed: completedStatusMap.get(entry.class_schoolwork_id) || false,
          due: entry.due,
          issued: entry.issued,
          name: entry.schoolwork_name,
          description: entry.schoolwork_description,
          class_name: classData?.class_name || null,
          teacher_name: teacherName,
          subject_name: teacherSubject,
        };
      }
    );

    const schoolwork = studentSchoolworkEntries.concat(
      teacherSchoolworkEntries
    ); // Combines both sets of data for returning below

    return NextResponse.json({ schoolwork });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
