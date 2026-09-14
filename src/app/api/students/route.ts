import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublicStudentProfiles, getStudentBatches } from "@/lib/services/faculty.service";
import { Role, AccountStatus } from "@prisma/client";

const ALLOWED_ROLES = [Role.STUDENT, Role.FACULTY, Role.ADMIN];

export async function GET(request: Request) {
  const session = await getSession();

  // 1. Unauthenticated Check -> 401
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized access. Authentication required." },
      { status: 401 }
    );
  }

  // 2. Role & Account Status Check -> 403
  if (!ALLOWED_ROLES.includes(session.role) || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json(
      { error: "Forbidden: Access restricted to authorized student, faculty, and admin accounts." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch") || undefined;

    const [students, availableBatches] = await Promise.all([
      getPublicStudentProfiles(batch, session.role),
      getStudentBatches(session.role),
    ]);

    return NextResponse.json({
      success: true,
      students,
      availableBatches,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch student profiles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
