import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const schoolwork = body.schoolwork;

  if (!schoolwork || !Array.isArray(schoolwork)) {
    return NextResponse.json(
      { error: "Invalid schoolwork data input" },
      { status: 400 }
    );
  }

  let topWeighting = 0;
  let topInfo = "";
  let topID = "";

  let teacherEntryPresent = false;
  let studentEntryPresent = false;

  function calculateWeighting(due: string) {
    const daysUntilDue =
      (new Date(due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24); // Converts to days

    if (daysUntilDue <= 0) {
      return 0.8; // Highest priority for overdue items
    } else if (daysUntilDue < 2) {
      return 0.7;
    } else if (daysUntilDue < 7) {
      return 0.6;
    } else if (daysUntilDue < 14) {
      return 0.5;
    } else if (daysUntilDue < 28) {
      return 0.4;
    } else {
      return 0.2; // Lowest priority for items due in over a month
    }
  }

  for (const entry of schoolwork) {
    // No check for due date like originally planned as due date cannot be null for schoolwork entries

    let weighting = 0;

    if (entry.schoolworkType === "Test") {
      weighting = calculateWeighting(entry.due) + 0.1; // Tests have a slightly higher priority
    } else if (entry.schoolworkType === "Homework") {
      weighting = calculateWeighting(entry.due);
    } else {
      return NextResponse.json(
        { error: "Invalid schoolwork type input for at least one entry" },
        { status: 400 }
      );
    }

    if (weighting > topWeighting) {
      topWeighting = weighting;
      topID = entry.id;
    }
  }

  if (topID) {
    type Entry = {
      id: string;
      category: number;
      schoolworkType: "Homework" | "Test";
      due: string;
      issued: string | null;
      name: string;
      description: string | null;
      subject_name: string | null;
      class_name: string | null;
      teacher_name: string | null;
      completed: boolean;
    };

    const topEntry = schoolwork.find((entry: Entry) => entry.id === topID);
    const daysUntilDue =
      (new Date(topEntry.due).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24); // Converts to days

    for (const entry of schoolwork) {
      if (entry.category === 1) {
        studentEntryPresent = true;
      } else {
        teacherEntryPresent = true;
      }

      if (teacherEntryPresent && studentEntryPresent) {
        break;
      }
    }

    const combinedRandom = Math.floor(Math.random() * 3); // Result is either 0 or 1 or 2
    let basedOnText = "";
    let teacherIssuedText = "";

    if (teacherEntryPresent && studentEntryPresent) {
      if (combinedRandom === 0) {
        basedOnText = "your combined teacher and student schoolwork entries";
      } else if (combinedRandom === 1) {
        basedOnText = `your ${schoolwork.length} teacher and student schoolwork entries`;
      } else if (combinedRandom === 2) {
        basedOnText = `your ${schoolwork.length} schoolwork entries`;
      }
    } else if (teacherEntryPresent) {
      if (combinedRandom === 0) {
        basedOnText = "your teacher schoolwork entries";
      } else if (combinedRandom === 1) {
        basedOnText = `your ${schoolwork.length} teacher schoolwork entries`;
      } else if (combinedRandom === 2) {
        basedOnText = `your ${schoolwork.length} schoolwork entries`;
      }
    } else if (studentEntryPresent) {
      if (combinedRandom === 0) {
        basedOnText = "your schoolwork entries";
      } else if (combinedRandom === 1) {
        basedOnText = `your ${schoolwork.length} schoolwork entries`;
      } else if (combinedRandom === 2) {
        basedOnText = `your ${schoolwork.length} schoolwork entries`;
      }
    }

    if (topEntry.issued && topEntry.category === 2) {
      const issuedFormatted = new Date(topEntry.issued).toLocaleDateString();

      if (combinedRandom === 0) {
        teacherIssuedText = ` This was issued on ${issuedFormatted} by ${
          topEntry.teacher_name ?? "your teacher"
        }.`;
      } else if (combinedRandom === 1) {
        teacherIssuedText = ` This was issued on ${issuedFormatted} by your teacher.`;
      } else if (combinedRandom === 2) {
        teacherIssuedText = ` This was issued by ${
          topEntry.teacher_name ?? "your teacher"
        } on ${issuedFormatted}.`;
      }
    }

    if (topEntry) {
      topInfo = `Based on ${basedOnText}, we recommend completing the "${
        topEntry.name
      }" ${topEntry.schoolworkType.toLowerCase()} which is ${
        daysUntilDue <= 0
          ? "overdue"
          : daysUntilDue < 1
          ? "due today"
          : `due in ${Math.round(daysUntilDue)} days`
      }.${teacherIssuedText}`;
    } else {
      return NextResponse.json(
        { error: "No recommendations available at this time" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "No recommendations available at this time" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    topInfo,
    topID,
  });
}
