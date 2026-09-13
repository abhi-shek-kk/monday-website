import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminAccountApprovalSchema } from "@/lib/validations";
import { updateAccountStatus } from "@/lib/services/user.service";
import { Role, AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = adminAccountApprovalSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0]?.message || "Invalid status payload.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { userId, status } = validationResult.data;

    const targetStatus = status === "APPROVED" ? AccountStatus.APPROVED : AccountStatus.REJECTED;
    const updatedUser = await updateAccountStatus(userId, targetStatus);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        status: updatedUser.status,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update account status.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
