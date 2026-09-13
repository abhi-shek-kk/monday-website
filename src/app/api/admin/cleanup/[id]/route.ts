import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteUserAdmin } from "@/lib/services/cleanup.service";
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
      return NextResponse.json({ error: "Missing user ID for deletion" }, { status: 400 });
    }

    const result = await deleteUserAdmin(userId, session.userId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete user profile.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
