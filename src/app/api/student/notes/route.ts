import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotes } from "@/lib/services/note.service";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semesterStr = searchParams.get("semester");
    const subjectId = searchParams.get("subjectId") || undefined;

    const semester = semesterStr ? parseInt(semesterStr, 10) : undefined;

    const notes = await getNotes({ semester, subjectId });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch study notes." },
      { status: 500 }
    );
  }
}
