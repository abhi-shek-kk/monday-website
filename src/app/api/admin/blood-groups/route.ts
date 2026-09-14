import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminBloodGroupsData } from "@/lib/services/admin.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const bloodGroups = await getAdminBloodGroupsData();
    return NextResponse.json({ success: true, bloodGroups });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch blood groups directory.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
