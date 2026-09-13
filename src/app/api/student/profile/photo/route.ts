import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToStorage, deleteFromStorage, MediaCategory } from "@/lib/storage";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getSession();

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

    // 3. Extract uploaded file from FormData
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Invalid form data submission." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. If existing profile photo had a storage key, safely delete old storage object
    const existingProfile = await db.studentProfile.findUnique({
      where: { id: studentProfile.id },
      select: { storageKey: true },
    });

    if (existingProfile?.storageKey) {
      await deleteFromStorage(existingProfile.storageKey, MediaCategory.PROFILE_PHOTO);
    }

    // 5. Upload new image to durable external storage
    const uploadResult = await uploadToStorage(buffer, {
      originalName: file.name || "profile_photo.jpg",
      mimeType: file.type || "image/jpeg",
      category: MediaCategory.PROFILE_PHOTO,
      uploaderId: session.userId,
    });

    // 6. Save metadata to PostgreSQL MediaFile table
    await db.mediaFile.create({
      data: {
        storageProvider: "CLOUDINARY",
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        category: MediaCategory.PROFILE_PHOTO,
        uploaderId: session.userId,
      },
    });

    // 7. Update StudentProfile in PostgreSQL
    const updatedProfile = await db.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        profilePhotoUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile photo uploaded successfully.",
      profilePhotoUrl: updatedProfile.profilePhotoUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload profile photo." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session || session.role !== Role.STUDENT || session.status !== AccountStatus.APPROVED) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const studentProfile = session.user.studentProfile;
    if (!studentProfile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const currentProfile = await db.studentProfile.findUnique({
      where: { id: studentProfile.id },
      select: { storageKey: true },
    });

    if (currentProfile?.storageKey) {
      await deleteFromStorage(currentProfile.storageKey, MediaCategory.PROFILE_PHOTO);
    }

    await db.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        profilePhotoUrl: null,
        storageKey: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile photo removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove profile photo." },
      { status: 500 }
    );
  }
}
