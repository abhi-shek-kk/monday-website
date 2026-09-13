import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSubjectsAdmin, createSubjectAdmin } from "@/lib/services/admin.service";
import { subjectSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const subjects = await getAllSubjectsAdmin();
    return NextResponse.json({ success: true, subjects });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch subjects.";
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
    const validationResult = subjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid subject payload" },
        { status: 400 }
      );
    }

    const created = await createSubjectAdmin(validationResult.data);
    return NextResponse.json({ success: true, subject: created });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create subject.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
