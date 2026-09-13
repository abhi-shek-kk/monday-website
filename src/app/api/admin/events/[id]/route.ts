import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateAdminEvent, deleteAdminEvent } from "@/lib/services/event.service";
import { eventSchema } from "@/lib/validations";
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
    const { id: eventId } = await params;
    const body = await request.json();
    const validationResult = eventSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateAdminEvent(eventId, validationResult.data);
    return NextResponse.json({ success: true, event: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update event.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN || session.status !== AccountStatus.APPROVED) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id: eventId } = await params;
    await deleteAdminEvent(eventId);
    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete event.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
