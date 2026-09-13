import { db } from "@/lib/db";

export async function createChatSession(userId?: string) {
  return db.chatSession.create({
    data: {
      userId: userId || null,
    },
  });
}

export async function addChatMessage(sessionId: string, role: string, content: string) {
  return db.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
    },
  });
}

export async function getChatSessionWithMessages(sessionId: string) {
  return db.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
