import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentFullProfile, updateStudentProfile } from "@/lib/services/student.service";
import { updateStudentProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const fullProfile = await getStudentFullProfile(session.user.id);
    if (!fullProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: fullProfile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateStudentProfileSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Ownership guaranteed via session.user.id; client body cannot override userId or role
    const updated = await updateStudentProfile(session.user.id, parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
