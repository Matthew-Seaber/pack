import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "User not signed in" }, { status: 401 });
    }

    const user_id = user.user_id;

    const { data: yearGroupData, error: yearGroupError } = await supabaseMainAdmin
          .from("students")
          .select("year_group")
          .eq("user_id", user_id)
          .single();
    
        if (yearGroupError) {
          console.error("Error getting student's year group:", yearGroupError);
          return NextResponse.json(
            { error: "Failed to get year group" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { yearGroup: yearGroupData?.year_group },
          { status: 200 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: `Error getting user data ${error}` },
      { status: 500 }
    );
  }
}
