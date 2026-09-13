import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteStudentAdmin } from "@/lib/services/admin.service";
import { Role, AccountStatus } from "@prisma/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json({ error: "Cannot delete logged-in admin account" }, { status: 400 });
    }

    await deleteStudentAdmin(userId);
    return NextResponse.json({ success: true, message: "Student record deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete student.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
