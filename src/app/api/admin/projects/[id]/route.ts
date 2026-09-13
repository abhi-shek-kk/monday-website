import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleProjectFeaturedAdmin, deleteProjectAdmin } from "@/lib/services/admin.service";
import { updateProjectAdminSchema } from "@/lib/validations";
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
    const { id: projectId } = await params;
    const body = await request.json();
    const validationResult = updateProjectAdminSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { isFeatured } = validationResult.data;
    if (isFeatured === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await toggleProjectFeaturedAdmin(projectId, isFeatured);
    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to moderate project.";
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
    const { id: projectId } = await params;
    await deleteProjectAdmin(projectId);
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete project.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
