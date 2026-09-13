import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminWings, createWingAdmin } from "@/lib/services/admin.service";
import { wingSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const wings = await getAdminWings();
    return NextResponse.json({ success: true, wings });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch wings.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = wingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid wing payload" },
        { status: 400 }
      );
    }

    const created = await createWingAdmin(validationResult.data);
    return NextResponse.json({ success: true, wing: created });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create wing.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
