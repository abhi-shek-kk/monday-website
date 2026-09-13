import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateFacultyNote, deleteFacultyNote } from "@/lib/services/note.service";
import { noteSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const facultyProfileId = session.user.facultyProfile?.id;
    if (!facultyProfileId) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 400 });
    }

    const { id: noteId } = await params;
    const body = await request.json();
    const validationResult = noteSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    // Server verifies noteId and uploaderId ownership match
    const updated = await updateFacultyNote(noteId, facultyProfileId, validationResult.data);
    return NextResponse.json({ success: true, note: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update note.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const facultyProfileId = session.user.facultyProfile?.id;
    if (!facultyProfileId) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 400 });
    }

    const { id: noteId } = await params;
    // Server verifies noteId and uploaderId ownership match
    await deleteFacultyNote(noteId, facultyProfileId);
    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete note.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
