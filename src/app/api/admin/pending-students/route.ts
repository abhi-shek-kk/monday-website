import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPendingStudentApprovals } from "@/lib/services/user.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const pendingStudents = await getPendingStudentApprovals();
    return NextResponse.json({ success: true, pendingStudents });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch pending student approvals.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
