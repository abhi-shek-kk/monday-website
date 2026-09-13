import { db } from "@/lib/db";
import { GalleryItemInput } from "@/lib/validations";
import { PublicationStatus } from "@prisma/client";
import { deleteFromStorage, MediaCategory } from "@/lib/storage";

export async function getPublicGalleryItems() {
  return db.galleryItem.findMany({
    where: {
      status: PublicationStatus.PUBLISHED,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      uploader: {
        select: {
          username: true,
          role: true,
        },
      },
    },
  });
}

export async function createGalleryItem(
  uploaderId: string,
  input: GalleryItemInput & { storageKey?: string }
) {
  return db.galleryItem.create({
    data: {
      uploaderId,
      imageUrl: input.imageUrl,
      storageKey: input.storageKey || null,
      caption: input.caption ? input.caption.trim() : null,
      status: input.status || PublicationStatus.PUBLISHED,
    },
  });
}

export async function deleteGalleryItem(itemId: string) {
  const existing = await db.galleryItem.findUnique({
    where: { id: itemId },
  });

  if (!existing) {
    throw new Error("Gallery item not found");
  }

  if (existing.storageKey) {
    await deleteFromStorage(existing.storageKey, MediaCategory.GALLERY_IMAGE);
  }

  return db.galleryItem.delete({
    where: { id: itemId },
  });
}
