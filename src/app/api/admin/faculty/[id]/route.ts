import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateFacultyAdmin } from "@/lib/services/admin.service";
import { updateFacultyProfileSchema } from "@/lib/validations";
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
    const { id: facultyProfileId } = await params;
    const body = await request.json();
    const validationResult = updateFacultyProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateFacultyAdmin(facultyProfileId, validationResult.data);
    return NextResponse.json({ success: true, facultyProfile: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update faculty profile.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
