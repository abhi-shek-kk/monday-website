import { db } from "@/lib/db";
import { NoteInput } from "@/lib/validations";
import { deleteFromStorage, MediaCategory } from "@/lib/storage";

export async function getNotes(filters?: { semester?: number; subjectId?: string }) {
  return db.note.findMany({
    where: {
      ...(filters?.semester ? { semester: filters.semester } : {}),
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
    },
    include: {
      subject: {
        select: {
          code: true,
          name: true,
          semester: true,
        },
      },
      uploader: {
        select: {
          fullName: true,
          designation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNoteById(id: string) {
  return db.note.findUnique({
    where: { id },
    include: {
      subject: true,
      uploader: true,
    },
  });
}

export async function createFacultyNote(
  uploaderId: string,
  input: NoteInput & { storageKey?: string }
) {
  return db.note.create({
    data: {
      uploaderId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      semester: input.semester,
      fileUrl: input.fileUrl,
      storageKey: input.storageKey || null,
      fileType: input.fileType || null,
      fileSize: input.fileSize || null,
      subjectId: input.subjectId,
    },
  });
}

export async function updateFacultyNote(
  noteId: string,
  uploaderId: string,
  input: Partial<NoteInput> & { storageKey?: string }
) {
  const existing = await db.note.findFirst({
    where: { id: noteId, uploaderId },
  });
  if (!existing) {
    throw new Error("Note not found or user unauthorized to edit");
  }

  if (input.storageKey && existing.storageKey && existing.storageKey !== input.storageKey) {
    await deleteFromStorage(existing.storageKey, MediaCategory.ACADEMIC_NOTE);
  }

  return db.note.update({
    where: { id: noteId },
    data: {
      ...(input.title ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.semester ? { semester: input.semester } : {}),
      ...(input.fileUrl ? { fileUrl: input.fileUrl.trim() } : {}),
      ...(input.storageKey !== undefined ? { storageKey: input.storageKey } : {}),
      ...(input.fileType !== undefined ? { fileType: input.fileType } : {}),
      ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
      ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    },
  });
}

export async function deleteFacultyNote(noteId: string, uploaderId: string) {
  const existing = await db.note.findFirst({
    where: { id: noteId, uploaderId },
  });
  if (!existing) {
    throw new Error("Note not found or user unauthorized to delete");
  }

  if (existing.storageKey) {
    await deleteFromStorage(existing.storageKey, MediaCategory.ACADEMIC_NOTE);
  }

  return db.note.delete({
    where: { id: noteId },
  });
}
