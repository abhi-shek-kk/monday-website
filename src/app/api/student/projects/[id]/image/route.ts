import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToStorage, deleteFromStorage, MediaCategory } from "@/lib/storage";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: projectId } = await params;

    // 1. Authenticate user
    if (!session || session.role !== Role.STUDENT) {
      return NextResponse.json(
        { error: "Unauthorized access. Student login required." },
        { status: 401 }
      );
    }

    // 2. Verify APPROVED status
    if (session.status !== AccountStatus.APPROVED) {
      return NextResponse.json(
        { error: "Forbidden. Account is pending or not approved." },
        { status: 403 }
      );
    }

    const studentProfile = session.user.studentProfile;
    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    // 3. Ownership check: Project MUST belong to session user's studentProfile
    const project = await db.project.findFirst({
      where: { id: projectId, studentId: studentProfile.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you are not authorized to modify it." },
        { status: 403 }
      );
    }

    // 4. Extract uploaded file from FormData
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form payload." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Delete old image from storage if present
    if (project.storageKey) {
      await deleteFromStorage(project.storageKey, MediaCategory.PROJECT_IMAGE);
    }

    // 6. Upload new project image to durable external storage
    const uploadResult = await uploadToStorage(buffer, {
      originalName: file.name || "project_image.jpg",
      mimeType: file.type || "image/jpeg",
      category: MediaCategory.PROJECT_IMAGE,
      uploaderId: session.userId,
    });

    // 7. Save metadata to PostgreSQL MediaFile table
    await db.mediaFile.create({
      data: {
        storageProvider: "CLOUDINARY",
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        category: MediaCategory.PROJECT_IMAGE,
        uploaderId: session.userId,
      },
    });

    // 8. Update Project in PostgreSQL
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        imageUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project image uploaded successfully.",
      imageUrl: updatedProject.imageUrl,
      project: updatedProject,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload project image." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: projectId } = await params;

    if (!session || session.role !== Role.STUDENT || session.status !== AccountStatus.APPROVED) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const studentProfile = session.user.studentProfile;
    if (!studentProfile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, studentId: studentProfile.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized." },
        { status: 403 }
      );
    }

    if (project.storageKey) {
      await deleteFromStorage(project.storageKey, MediaCategory.PROJECT_IMAGE);
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        imageUrl: null,
        storageKey: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project image removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove project image." },
      { status: 500 }
    );
  }
}
