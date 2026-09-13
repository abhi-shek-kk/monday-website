import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteNoteAdmin } from "@/lib/services/admin.service";
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
    const { id: noteId } = await params;
    await deleteNoteAdmin(noteId);
    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete note.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
