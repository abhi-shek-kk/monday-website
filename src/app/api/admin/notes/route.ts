import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminNotes } from "@/lib/services/admin.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const notes = await getAdminNotes();
    return NextResponse.json({ success: true, notes });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch notes.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
