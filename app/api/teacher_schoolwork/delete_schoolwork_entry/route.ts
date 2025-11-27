import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { entryID, classID } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    // Security check to ensure users don't exploit API and delete entries from classes they don't teach
    const { data: userConfirmationData, error: userConfirmationError } = await supabaseMainAdmin
      .from("classes")
      .select("teacher_id")
      .eq("class_id", classID)
      .single();

    if (userConfirmationError) {
      console.error("Error confirming user:", userConfirmationError);
      return NextResponse.json(
        { error: "Error confirming user is connected to the class" },
        { status: 500 }
      );
    }

    if (userConfirmationData.teacher_id !== user_id) {
      return NextResponse.json(
        { error: "User not authorised to delete entries from this class" },
        { status: 403 }
      );
    }

    const { error: fetchError } = await supabaseMainAdmin
      .from("class_schoolwork")
      .delete()
      .eq("class_schoolwork_id", entryID)
      .eq("class_id", classID);

    if (fetchError) {
      console.error("Error deleting schoolwork entry:", fetchError);
      return NextResponse.json(
        { error: "Failed to delete schoolwork entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted schoolwork entry ${entryID} from the DB`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
