import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateWingAdmin } from "@/lib/services/admin.service";
import { wingSchema } from "@/lib/validations";
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
    const { id: wingId } = await params;
    const body = await request.json();
    const validationResult = wingSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateWingAdmin(wingId, validationResult.data);
    return NextResponse.json({ success: true, wing: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update wing.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
