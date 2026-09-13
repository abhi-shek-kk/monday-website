import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateStudentProject, deleteStudentProject } from "@/lib/services/project.service";
import { projectSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = projectSchema.partial().safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Mandatory ownership check inside updateStudentProject
    const updated = await updateStudentProject(projectId, studentProfileId, parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully.",
      project: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update project." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: projectId } = await params;

    // Mandatory ownership check inside deleteStudentProject
    await deleteStudentProject(projectId, studentProfileId);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete project." },
      { status: 400 }
    );
  }
}
