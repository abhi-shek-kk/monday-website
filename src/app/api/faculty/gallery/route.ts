import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createGalleryItem } from "@/lib/services/gallery.service";
import { galleryItemSchema } from "@/lib/validations";
import { uploadToStorage, MediaCategory } from "@/lib/storage";
import { Role, AccountStatus, PublicationStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const caption = (formData.get("caption") as string | null) || "";

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Gallery image file is required." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadToStorage(buffer, {
        originalName: file.name || "gallery_item.jpg",
        mimeType: file.type || "image/jpeg",
        category: MediaCategory.GALLERY_IMAGE,
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
          category: MediaCategory.GALLERY_IMAGE,
          uploaderId: session.userId,
        },
      });

      const created = await createGalleryItem(session.userId, {
        imageUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
        caption,
        status: PublicationStatus.PUBLISHED,
      });

      return NextResponse.json({ success: true, galleryItem: created });
    }

    const body = await request.json();
    const validationResult = galleryItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid gallery item payload" },
        { status: 400 }
      );
    }

    const created = await createGalleryItem(session.userId, validationResult.data);
    return NextResponse.json({ success: true, galleryItem: created });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create gallery item.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
