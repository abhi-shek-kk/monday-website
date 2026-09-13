import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWingsWithStudentStatus, toggleWingMembership } from "@/lib/services/student.service";
import { z } from "zod";

const wingToggleSchema = z.object({
  wingId: z.string().min(1, "Wing ID is required"),
  action: z.enum(["join", "leave"]).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const studentProfileId = session.user.studentProfile?.id;
    if (!studentProfileId) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const wings = await getWingsWithStudentStatus(studentProfileId);

    return NextResponse.json({ success: true, wings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch wings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const studentProfileId = session.user.studentProfile?.id;
    if (!studentProfileId) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = wingToggleSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { wingId, action } = parseResult.data;

    // Ownership enforced: only session studentProfileId is modified
    const result = await toggleWingMembership(studentProfileId, wingId, action);

    return NextResponse.json({
      success: true,
      message: result.joined ? "Joined wing successfully." : "Left wing successfully.",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to modify wing membership." },
      { status: 500 }
    );
  }
}
