import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFacultyDashboardData } from "@/lib/services/faculty.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const data = await getFacultyDashboardData(session.userId);
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch faculty dashboard data.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
