import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assignFacultyToSubject, removeFacultyFromSubject } from "@/lib/services/admin.service";
import { subjectAssignmentSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = subjectAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid assignment payload" },
        { status: 400 }
      );
    }

    const { facultyId, subjectId } = validationResult.data;
    const assignment = await assignFacultyToSubject(facultyId, subjectId);
    return NextResponse.json({ success: true, assignment });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to assign faculty to subject.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = subjectAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid assignment payload" },
        { status: 400 }
      );
    }

    const { facultyId, subjectId } = validationResult.data;
    await removeFacultyFromSubject(facultyId, subjectId);
    return NextResponse.json({ success: true, message: "Faculty removed from subject successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to remove assignment.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
