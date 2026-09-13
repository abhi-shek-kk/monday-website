import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToStorage, deleteFromStorage, MediaCategory } from "@/lib/storage";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== Role.FACULTY) {
      return NextResponse.json(
        { error: "Unauthorized access. Faculty login required." },
        { status: 401 }
      );
    }

    if (session.status !== AccountStatus.APPROVED) {
      return NextResponse.json(
        { error: "Forbidden. Account is pending or not approved." },
        { status: 403 }
      );
    }

    const facultyProfile = session.user.facultyProfile;
    if (!facultyProfile) {
      return NextResponse.json(
        { error: "Faculty profile not found." },
        { status: 404 }
      );
    }

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

    // Delete existing photo if present
    const existing = await db.facultyProfile.findUnique({
      where: { id: facultyProfile.id },
      select: { storageKey: true },
    });

    if (existing?.storageKey) {
      await deleteFromStorage(existing.storageKey, MediaCategory.FACULTY_PHOTO);
    }

    const uploadResult = await uploadToStorage(buffer, {
      originalName: file.name || "faculty_photo.jpg",
      mimeType: file.type || "image/jpeg",
      category: MediaCategory.FACULTY_PHOTO,
      uploaderId: session.userId,
    });

    await db.mediaFile.create({
      data: {
        storageProvider: "CLOUDINARY",
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        category: MediaCategory.FACULTY_PHOTO,
        uploaderId: session.userId,
      },
    });

    const updatedProfile = await db.facultyProfile.update({
      where: { id: facultyProfile.id },
      data: {
        profilePhotoUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Faculty profile photo uploaded successfully.",
      profilePhotoUrl: updatedProfile.profilePhotoUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload faculty profile photo." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const facultyProfile = session.user.facultyProfile;
    if (!facultyProfile) {
      return NextResponse.json({ error: "Faculty profile not found." }, { status: 404 });
    }

    const existing = await db.facultyProfile.findUnique({
      where: { id: facultyProfile.id },
      select: { storageKey: true },
    });

    if (existing?.storageKey) {
      await deleteFromStorage(existing.storageKey, MediaCategory.FACULTY_PHOTO);
    }

    await db.facultyProfile.update({
      where: { id: facultyProfile.id },
      data: {
        profilePhotoUrl: null,
        storageKey: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Faculty profile photo removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove photo." },
      { status: 500 }
    );
  }
}
