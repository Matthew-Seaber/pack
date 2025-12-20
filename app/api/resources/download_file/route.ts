import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryID = searchParams.get("entryID");

    if (!entryID) {
      return NextResponse.json({ error: "Missing entryID" }, { status: 400 });
    }

    const { data: locationData, error: locationError } = await supabaseMainAdmin
      .from("resources")
      .select(
        "location"
      )
      .eq("resource_id", entryID)
      .single();

    if (locationError) {
      console.error("Error getting file location:", locationError);
      return NextResponse.json(
        { error: "Failed to get file location" },
        { status: 500 }
      );
    }

    // Fetch the file using its public URL
    const fileResponse = await fetch(locationData.location);
    
    if (!fileResponse.ok) {
      console.error("Error fetching file from URL:", fileResponse.statusText);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    // Get content type from the response headers
    const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";

    const fileBuffer = await fileResponse.arrayBuffer();
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="resource"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error, ${error}` },
      { status: 500 }
    );
  }
}
