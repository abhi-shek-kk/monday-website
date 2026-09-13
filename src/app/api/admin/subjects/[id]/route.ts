import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateSubjectAdmin, deleteSubjectAdmin } from "@/lib/services/admin.service";
import { subjectSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: subjectId } = await params;
    const body = await request.json();
    const validationResult = subjectSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateSubjectAdmin(subjectId, validationResult.data);
    return NextResponse.json({ success: true, subject: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update subject.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: subjectId } = await params;
    await deleteSubjectAdmin(subjectId);
    return NextResponse.json({ success: true, message: "Subject deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete subject.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
