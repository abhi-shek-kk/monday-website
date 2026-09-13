import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createFacultyNote, getNotes } from "@/lib/services/note.service";
import { noteSchema } from "@/lib/validations";
import { uploadToStorage, MediaCategory } from "@/lib/storage";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const facultyProfileId = session.user.facultyProfile?.id;
    if (!facultyProfileId) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 400 });
    }

    const notes = await getNotes();
    const ownNotes = notes.filter((n: { uploaderId?: string }) => n.uploaderId === facultyProfileId);

    return NextResponse.json({ success: true, notes: ownNotes });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch notes.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const facultyProfileId = session.user.facultyProfile?.id;
    if (!facultyProfileId) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle Multipart FormData Upload (Direct File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string | null;
      const description = formData.get("description") as string | null;
      const semesterStr = formData.get("semester") as string | null;
      const subjectId = formData.get("subjectId") as string | null;

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Academic note document file is required." }, { status: 400 });
      }

      if (!title || !semesterStr || !subjectId) {
        return NextResponse.json(
          { error: "Title, semester, and subject ID are required." },
          { status: 400 }
        );
      }

      const semester = parseInt(semesterStr, 10);
      if (isNaN(semester) || semester < 1 || semester > 8) {
        return NextResponse.json({ error: "Semester must be a valid number between 1 and 8." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload file to durable external storage
      const uploadResult = await uploadToStorage(buffer, {
        originalName: file.name || "note.pdf",
        mimeType: file.type || "application/pdf",
        category: MediaCategory.ACADEMIC_NOTE,
        uploaderId: session.userId,
      });

      // Register MediaFile in DB
      await db.mediaFile.create({
        data: {
          storageProvider: "CLOUDINARY",
          publicId: uploadResult.publicId,
          url: uploadResult.url,
          originalName: uploadResult.originalName,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          category: MediaCategory.ACADEMIC_NOTE,
          uploaderId: session.userId,
        },
      });

      // Create Note record in DB
      const createdNote = await createFacultyNote(facultyProfileId, {
        title,
        description: description || undefined,
        semester,
        subjectId,
        fileUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
        fileType: uploadResult.mimeType,
        fileSize: uploadResult.size,
      });

      return NextResponse.json({ success: true, note: createdNote });
    }

    // Handle standard JSON payload
    const body = await request.json();
    const validationResult = noteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid note payload" },
        { status: 400 }
      );
    }

    const createdNote = await createFacultyNote(facultyProfileId, validationResult.data);
    return NextResponse.json({ success: true, note: createdNote });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create note.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
