import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin"; // TESTING

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  // TESTING
  try {
      const {} = await supabaseMainAdmin
        .from("users")
        .insert([
          {
            username: "TEST",
            email :"TEST",
            password: "TEST",
            first_name: "TEST",
            role: "Student",
          },
        ])
  } catch (error) {
    console.error("Error inserting test user:", error);
  }
  // TESTING END

  try {
    const body = await req.json();
    
    const { error, details, userId, context } = body;

    // Formatting email
    const subject = "Pack Signup Rollback error";
    const emailContent = `
      <h2>${subject}</h2>
      <h3><strong>Error:</strong> ${error || "N/A"}</h3>
      <p><strong>Context:</strong> ${context || "N/A"}</p>
      <p><strong>User ID:</strong> ${userId || "N/A"}</p>
      <p><strong>Details:</strong> ${details || "N/A"}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr>
      <p><em>Automated email from Pack</em></p>
    `;

    await resend.emails.send({
      from: 'Pack Support <support@packapp.co.uk>',
      to: [process.env.ERROR_NOTIFICATION_EMAIL!],
      subject: subject,
      html: emailContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to send email: ${error}` },
      { status: 500 }
    );
  }
}
