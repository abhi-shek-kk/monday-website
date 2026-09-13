import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminEvents } from "@/lib/services/admin.service";
import { createAdminEvent } from "@/lib/services/event.service";
import { eventSchema } from "@/lib/validations";
import { Role, AccountStatus } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const events = await getAdminEvents();
    return NextResponse.json({ success: true, events });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch events.";
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
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid event payload" },
        { status: 400 }
      );
    }

    const created = await createAdminEvent(session.userId, validationResult.data);
    return NextResponse.json({ success: true, event: created });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create event.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
