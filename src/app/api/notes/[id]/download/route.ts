import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSignedDownloadUrl, MediaCategory } from "@/lib/storage";
import { AccountStatus } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params;
    const session = await getSession();

    // 1. Authenticate user - Must be logged in
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required to download academic resources." },
        { status: 401 }
      );
    }

    // 2. Verify account status - Must be APPROVED
    if (session.status !== AccountStatus.APPROVED) {
      return NextResponse.json(
        { error: "Forbidden. Account is pending or not approved for downloading academic resources." },
        { status: 403 }
      );
    }

    // 3. Retrieve note metadata from PostgreSQL database
    const note = await db.note.findUnique({
      where: { id: noteId },
      include: {
        subject: {
          select: { code: true, name: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Academic resource note not found." },
        { status: 404 }
      );
    }

    // 4. If note has managed storageKey, generate signed temporary URL
    if (note.storageKey) {
      const signedUrl = generateSignedDownloadUrl(note.storageKey, MediaCategory.ACADEMIC_NOTE, 900);
      return NextResponse.json({
        success: true,
        downloadUrl: signedUrl,
        filename: `${note.subject.code}_${note.title.replace(/[^a-zA-Z0-9]/g, "_")}`,
        fileType: note.fileType,
        fileSize: note.fileSize,
      });
    }

    // 5. Otherwise return safe access URL reference
    return NextResponse.json({
      success: true,
      downloadUrl: note.fileUrl,
      filename: `${note.subject.code}_${note.title.replace(/[^a-zA-Z0-9]/g, "_")}`,
      fileType: note.fileType,
      fileSize: note.fileSize,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate download URL." },
      { status: 500 }
    );
  }
}
