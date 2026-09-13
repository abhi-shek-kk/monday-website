import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminStudentsList } from "@/lib/services/admin.service";
import { Role, AccountStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const batch = searchParams.get("batch") || undefined;
    const statusParam = searchParams.get("status") as AccountStatus | null;
    const status = statusParam && Object.values(AccountStatus).includes(statusParam) ? statusParam : undefined;

    const students = await getAdminStudentsList({ query, batch, status });
    return NextResponse.json({ success: true, students });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch student directory.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
