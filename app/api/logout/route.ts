import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
  await logout();

  return NextResponse.json({
    message: "Successfully logged out user",
    clearCache: true,
  });
}
