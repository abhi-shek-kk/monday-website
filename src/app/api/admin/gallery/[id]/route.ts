import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateGalleryItemAdmin } from "@/lib/services/admin.service";
import { deleteGalleryItem } from "@/lib/services/gallery.service";
import { updateGalleryAdminSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: itemId } = await params;
    const body = await request.json();
    const validationResult = updateGalleryAdminSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateGalleryItemAdmin(itemId, validationResult.data);
    return NextResponse.json({ success: true, galleryItem: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update gallery item.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: itemId } = await params;
    await deleteGalleryItem(itemId);
    return NextResponse.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete gallery item.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
