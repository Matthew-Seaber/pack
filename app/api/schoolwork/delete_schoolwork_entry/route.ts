import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { schoolworkID } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    const { error: fetchError } = await supabaseMainAdmin
      .from("schoolwork")
      .delete()
      .eq("schoolwork_id", schoolworkID)
      .eq("user_id", user_id);

    if (fetchError) {
      console.error("Error deleting schoolwork entry:", fetchError);
      return NextResponse.json(
        { error: "Failed to delete schoolwork entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted schoolwork entry ${schoolworkID} from the DB`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
