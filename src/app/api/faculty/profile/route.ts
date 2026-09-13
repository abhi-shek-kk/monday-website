import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateFacultyProfileSelf } from "@/lib/services/faculty.service";
import { updateFacultyProfileSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.FACULTY || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Faculty access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = updateFacultyProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid profile payload" },
        { status: 400 }
      );
    }

    const updatedProfile = await updateFacultyProfileSelf(session.userId, validationResult.data);
    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update profile.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
