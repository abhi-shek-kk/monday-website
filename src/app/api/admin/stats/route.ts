import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminOverviewStats } from "@/lib/services/admin.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const stats = await getAdminOverviewStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
