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
    const classID = searchParams.get("classID");

    if (!classID) {
      return NextResponse.json(
        { error: "Missing required parameter" },
        { status: 400 }
      );
    }

    const { data: classData, error: classFetchError } = await supabaseMainAdmin
      .from("classes")
      .select("class_name")
      .eq("class_id", classID)
      .single();

    if (classFetchError) {
      console.error("Error getting class:", classFetchError);
      return NextResponse.json(
        { error: "Failed to get class ID" },
        { status: 500 }
      );
    }

    const className = classData.class_name;

    const { data: schoolworkData, error: schoolworkFetchError } =
      await supabaseMainAdmin
        .from("class_schoolwork")
        .select(
          "class_schoolwork_id, course_id, type, due, issued, schoolwork_name, schoolwork_description"
        )
        .eq("class_id", classID);

    if (schoolworkFetchError) {
      console.error("Error getting schoolwork:", schoolworkFetchError);
      return NextResponse.json(
        { error: "Failed to get schoolwork" },
        { status: 500 }
      );
    }

    const schoolworkIDs = schoolworkData.map(
      (entry) => entry.class_schoolwork_id
    );

    // Get all student link data for schoolwork entries
    const { data: studentLinkData, error: studentLinkFetchError } =
      await supabaseMainAdmin
        .from("schoolwork_student_link")
        .select("class_schoolwork_id, completed")
        .in("class_schoolwork_id", schoolworkIDs);

    if (studentLinkFetchError) {
      console.error("Error getting student links:", studentLinkFetchError);
      return NextResponse.json(
        { error: "Failed to get student links" },
        { status: 500 }
      );
    }

    // Group student links by schoolwork ID and calculate completion statistics
    const completionMap = new Map<
      number,
      { completed: number; total: number }
    >();

    studentLinkData.forEach((link) => {
      const schoolworkID = link.class_schoolwork_id;
      if (!completionMap.has(schoolworkID)) {
        completionMap.set(schoolworkID, { completed: 0, total: 0 }); // Creates entry if not yet exists
      }

      const stats = completionMap.get(schoolworkID)!;
      stats.total += 1;

      if (link.completed) {
        stats.completed += 1;
      }
    });

    // Combine schoolwork data with completion stats
    const schoolworkEntries = schoolworkData.map((entry) => {
      const stats = completionMap.get(entry.class_schoolwork_id) || {
        completed: 0,
        total: 0,
      }; // Sets to "0/0" if no students assigned to the homework/test

      return {
        class_schoolwork_id: entry.class_schoolwork_id,
        course_id: entry.course_id,
        type: entry.type,
        due: entry.due,
        issued: entry.issued,
        schoolwork_name: entry.schoolwork_name,
        schoolwork_description: entry.schoolwork_description,
        completion: `${stats.completed}/${stats.total}`,
      };
    });

    return NextResponse.json({ className, schoolwork: schoolworkEntries });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
