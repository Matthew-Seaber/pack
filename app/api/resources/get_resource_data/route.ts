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

    // Get resources and specification entry data by joining course_resource_link with specification_entries (using course_id and topic), and then joining again with the resources table using resource_id
    const { data: resourceLinkData, error: resourceLinkFetchError } =
      await supabaseMainAdmin
        .from("course_resource_link")
        .select(
          `
          resource_id,
          specification_entry_id,
          resources!inner(
            resource_id,
            location,
            uploaded_at,
            resource_name,
            resource_description,
            type,
            creator
          ),
          specification_entries!specification_entry_id(
            topic,
            paper,
            common,
            difficult
          )
        `
        )
        .eq("course_id", courseID)
        .eq("specification_entries.course_id", courseID);

    if (resourceLinkFetchError) {
      console.error("Error getting resource entries:", resourceLinkFetchError);

      return NextResponse.json(
        { error: "Failed to get resource entries" },
        { status: 500 }
      );
    }

    // Combines data into format of the ResourceEntry interface
    const resourceEntries = resourceLinkData.map((entry) => {
      const resource = Array.isArray(entry.resources)
        ? entry.resources[0]
        : entry.resources;
      const specificationEntry = Array.isArray(entry.specification_entries)
        ? entry.specification_entries[0]
        : entry.specification_entries;

      const resourceName = resource?.resource_name;
      const resourceDescription = resource?.resource_description || "";
      const location = resource?.location;
      const topic = specificationEntry?.topic || null;
      const paper = specificationEntry?.paper || null;
      const uploadedAt = resource?.uploaded_at;
      const type = resource?.type;
      const creator = resource?.creator;
      const commonTopic = specificationEntry?.common || false;
      const difficultTopic = specificationEntry?.difficult || false;

      return {
        id: entry.resource_id,
        resource_name: resourceName,
        resource_description: resourceDescription,
        location: location,
        topic: topic,
        paper: paper,
        uploaded_at: uploadedAt,
        type: type,
        creator: creator,
        commonTopic: commonTopic,
        difficultTopic: difficultTopic,
      };
    });

    return NextResponse.json({ resourceEntries });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
