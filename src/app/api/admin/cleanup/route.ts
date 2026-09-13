import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminProfileCleanupList } from "@/lib/services/cleanup.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const cleanupItems = await getAdminProfileCleanupList();
    return NextResponse.json({ success: true, cleanupItems });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load profile cleanup data.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
