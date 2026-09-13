import { db } from "@/lib/db";
import { EventInput } from "@/lib/validations";
import { PublicationStatus } from "@prisma/client";

export async function getPublicEvents() {
  return db.event.findMany({
    where: {
      status: PublicationStatus.PUBLISHED,
    },
    orderBy: {
      eventDate: "asc",
    },
  });
}

export async function createAdminEvent(createdById: string, input: EventInput) {
  return db.event.create({
    data: {
      createdById,
      title: input.title,
      description: input.description,
      eventDate: input.eventDate,
      location: input.location,
      imageUrl: input.imageUrl,
      status: input.status,
    },
  });
}

export async function updateAdminEvent(eventId: string, input: Partial<EventInput>) {
  return db.event.update({
    where: { id: eventId },
    data: input,
  });
}

export async function deleteAdminEvent(eventId: string) {
  return db.event.delete({
    where: { id: eventId },
  });
}
