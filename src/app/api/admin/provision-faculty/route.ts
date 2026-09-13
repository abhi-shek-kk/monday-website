import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { facultyProvisionSchema } from "@/lib/validations";
import { provisionFacultyUser } from "@/lib/services/user.service";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = facultyProvisionSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0]?.message || "Invalid faculty provision payload.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const facultyUser = await provisionFacultyUser(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Faculty account provisioned successfully.",
        user: {
          id: facultyUser.id,
          username: facultyUser.username,
          role: facultyUser.role,
          status: facultyUser.status,
          facultyProfile: facultyUser.facultyProfile,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to provision faculty user.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
