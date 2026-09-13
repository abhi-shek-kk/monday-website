import { NextResponse } from "next/server";
import { streamText, createDataStreamResponse } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createChatSession, addChatMessage } from "@/lib/services/chat.service";

// Request body validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1, "Message content cannot be empty").max(2000, "Message too long"),
    })
  ).min(1, "At least one message is required"),
  sessionId: z.string().nullable().optional(),
});

// Rate limiting map per IP (max 12 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (limit.count >= 12) {
    return false;
  }
  limit.count += 1;
  return true;
}

/**
 * Explicit Privacy & Security Guard to block requests for private info,
 * credentials, passwords, session data, or storage URLs.
 */
function checkPrivateDataRequest(query: string): { forbidden: boolean; responseMessage?: string } {
  const q = query.toLowerCase();

  // Pattern checks for passwords, credentials, secrets, tokens
  if (
    q.includes("password") ||
    q.includes("passhash") ||
    q.includes("credential") ||
    q.includes("jwt_secret") ||
    q.includes("secret") ||
    q.includes("token") ||
    q.includes("database_url") ||
    q.includes("env")
  ) {
    return {
      forbidden: true,
      responseMessage: "I cannot provide password, credential, or system configuration information.",
    };
  }

  // Pattern checks for student private profiles, personal contact info, register numbers
  if (
    q.includes("student profile") ||
    q.includes("student phone") ||
    q.includes("student email") ||
    q.includes("student address") ||
    q.includes("register number") ||
    q.includes("private profile") ||
    q.includes("personal information") ||
    q.includes("faculty phone") ||
    q.includes("faculty email") ||
    q.includes("faculty address") ||
    q.includes("admin password") ||
    q.includes("admin profile") ||
    q.includes("user list")
  ) {
    return {
      forbidden: true,
      responseMessage: "I can't provide private user or profile information.",
    };
  }

  // Pattern checks for private file URLs, Cloudinary API keys, storage keys
  if (
    q.includes("cloudinary_url") ||
    q.includes("storagekey") ||
    q.includes("cloudinary key") ||
    q.includes("raw url") ||
    q.includes("mediafile")
  ) {
    return {
      forbidden: true,
      responseMessage: "I cannot expose private storage keys or storage URLs.",
    };
  }

  return { forbidden: false };
}

export async function POST(request: Request) {
  try {
    // 1. Rate limiting check
    const clientIp = request.headers.get("x-forwarded-for") || "local-client";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before asking more questions." },
        { status: 429 }
      );
    }

    // 2. Validate payload
    const body = await request.json().catch(() => ({}));
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: `Invalid payload: ${errorMsg}` }, { status: 400 });
    }

    const { messages, sessionId: providedSessionId } = parseResult.data;
    const lastUserMessage = messages[messages.length - 1];

    if (lastUserMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user." }, { status: 400 });
    }

    const trimmedUserMessage = lastUserMessage.content.trim();
    if (!trimmedUserMessage) {
      return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
    }

    // 3. User Session Verification (Authoritative RBAC)
    const authSession = await getSession().catch(() => null);
    const currentUserId = authSession?.userId;
    const isApprovedUser = authSession && authSession.status === "APPROVED";

    // 4. Manage Session & Log Messages
    let activeSessionId: string = providedSessionId || "";
    if (!activeSessionId) {
      const newSession = await createChatSession(currentUserId);
      activeSessionId = newSession.id;
    }

    await addChatMessage(activeSessionId, "user", trimmedUserMessage).catch((e) =>
      console.error("Failed to save user message:", e)
    );

    // 5. Pre-grounding security check against forbidden data requests
    const securityCheck = checkPrivateDataRequest(trimmedUserMessage);
    if (securityCheck.forbidden && securityCheck.responseMessage) {
      const msg = securityCheck.responseMessage;
      await addChatMessage(activeSessionId, "assistant", msg).catch(() => {});
      return createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.write(`0:${JSON.stringify(msg)}\n`);
        },
        headers: {
          "x-chat-session-id": activeSessionId,
        },
      });
    }

    // 6. EXPLICIT ALLOWLIST FETCHING ONLY (Strictly Public & Authorized Information)
    // ALLOWLIST SOURCE 1: Public Subjects / Courses
    const subjects = await db.subject.findMany({
      select: { code: true, name: true, semester: true, description: true },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });

    // ALLOWLIST SOURCE 2: Academic Notes Metadata (Authoritative Access Check)
    let notesMetadataText = "Academic note downloads require an approved student/faculty account.";
    if (isApprovedUser) {
      const notes = await db.note.findMany({
        select: {
          id: true,
          title: true,
          semester: true,
          subject: { select: { code: true, name: true } },
        },
        take: 20,
      });

      if (notes.length > 0) {
        notesMetadataText = notes
          .map(
            (n: { id: string; title: string; semester: number; subject: { code: string; name: string } }) =>
              `- [Sem ${n.semester}] Note "${n.title}" for ${n.subject.code} (${n.subject.name}). Available via Student/Faculty portal download endpoint.`
          )
          .join("\n");
      } else {
        notesMetadataText = "No academic notes uploaded yet.";
      }
    }

    // ALLOWLIST SOURCE 3: Public Published Events
    const eventsList = await db.event.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, description: true, eventDate: true, location: true },
      take: 10,
    });

    // ALLOWLIST SOURCE 4: Co-curricular Wings
    const wingsList = await db.wing.findMany({
      select: { name: true, type: true, description: true },
    });

    // Construct grounded context purely from explicit allowlist sources
    const allowlistContext = `
==================================================
EXPLICIT ALLOWLIST DEPARTMENT KNOWLEDGE BASE
==================================================
INSTITUTION: St. Berchmans College, Changanassery, Kottayam District, Kerala.
DEPARTMENT: Department of Artificial Intelligence & Data Science.
PROGRAM: BSc Artificial Intelligence & Data Science (4-Year Degree / 8 Semesters).
COHORT: First Batch: 2026–2030.

COURSES & SYLLABUS ALLOWLIST (${subjects.length} courses):
${
  subjects.length > 0
    ? subjects
        .map(
          (s: { code: string; name: string; semester: number; description: string | null }) =>
            `- Sem ${s.semester} | ${s.code}: ${s.name}${s.description ? ` — ${s.description}` : ""}`
        )
        .join("\n")
    : "No course syllabus populated yet."
}

ACADEMIC NOTES ALLOWLIST:
${notesMetadataText}

PUBLISHED EVENTS ALLOWLIST (${eventsList.length} events):
${
  eventsList.length > 0
    ? eventsList
        .map(
          (e: { title: string; description: string; eventDate: Date; location: string | null }) =>
            `- ${e.title} (${new Date(e.eventDate).toLocaleDateString()}${e.location ? `, ${e.location}` : ""}): ${e.description}`
        )
        .join("\n")
    : "No published events at present."
}

CO-CURRICULAR WINGS ALLOWLIST:
${
  wingsList.length > 0
    ? wingsList.map((w: { name: string; type: string; description: string | null }) => `- ${w.name} (${w.type}): ${w.description || "Active organization"}`).join("\n")
    : "- NSS Wing: Community Service\n- Tech Team: Software Development & Hackathons\n- Sports Wing: Athletics & Fitness\n- NCC Wing: Leadership Cadet Corps"
}
==================================================
`;

    const systemPrompt = `You are Melbin, the official AI Information Assistant for the Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery.

RESTRICTED KNOWLEDGE BOUNDARIES:
- Your knowledge is STRICTLY restricted to:
  1. Public department information
  2. Academic subjects/courses
  3. Authorized academic notes metadata
  4. General academic information

CRITICAL PRIVACY & SECURITY RESTRICTIONS:
- You MUST NOT retrieve, summarize, expose, or reveal student profiles, personal info, student contact details, faculty private info, admin credentials, passwords, usernames, session tokens, database connection strings, internal database IDs, raw MediaFile records, or private Cloudinary storage URLs.
- If a user asks for private profile or user details, state clearly: "I can't provide private user or profile information."
- If an unauthenticated user asks for academic note files, inform them that protected downloads require an approved account login.

${allowlistContext}`;

    // 7. Call Gemini AI API via SDK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "demo_gemini_key") {
      const q = trimmedUserMessage.toLowerCase();
      let responseContent = "";

      if (q.includes("course") || q.includes("semester") || q.includes("sem") || q.includes("subject")) {
        if (subjects.length > 0) {
          const sem1Subjects = subjects.filter((s: { semester: number }) => s.semester === 1);
          if (q.includes("1") || q.includes("first") || q.includes("semester 1")) {
            responseContent = `The courses offered in Semester 1 are:\n` +
              sem1Subjects.map((s: { code: string; name: string; description: string | null }) => `- **${s.code}**: ${s.name}${s.description ? ` — ${s.description}` : ""}`).join("\n");
          } else {
            responseContent = `The Department of AI & Data Science offers the following courses across semesters:\n` +
              subjects.map((s: { semester: number; code: string; name: string }) => `- Sem ${s.semester} | **${s.code}**: ${s.name}`).join("\n");
          }
        } else {
          responseContent = "Our 4-Year BSc AI & Data Science curriculum covers fundamental mathematics, programming, machine learning, and data analytics across 8 semesters.";
        }
      } else if (q.includes("department") || q.includes("about") || q.includes("ai & data science") || q.includes("st. berchmans")) {
        responseContent = "The Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery offers a modern 4-year degree (8 semesters) designed to prepare students for cutting-edge careers in AI, machine learning, and analytics.";
      } else if (q.includes("event")) {
        responseContent = eventsList.length > 0
          ? `Upcoming department events:\n` + eventsList.map((e: { title: string; eventDate: Date; description: string }) => `- **${e.title}** (${new Date(e.eventDate).toLocaleDateString()}): ${e.description}`).join("\n")
          : "No published events at present. Please check back soon!";
      } else if (q.includes("wing") || q.includes("club") || q.includes("co-curricular")) {
        responseContent = wingsList.length > 0
          ? `Co-curricular wings active in the department:\n` + wingsList.map((w: { name: string; type: string; description: string | null }) => `- **${w.name}** (${w.type}): ${w.description || "Active organization"}`).join("\n")
          : "Active co-curricular wings include NSS Wing, Tech Team, Sports Wing, and NCC Wing.";
      } else {
        responseContent = "Hello! I am Melbin, your Department AI Assistant. How can I help you with our curriculum, subject codes, faculty, events, or student wings today?";
      }

      await addChatMessage(activeSessionId, "assistant", responseContent).catch(() => {});
      return createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.write(`0:${JSON.stringify(responseContent)}\n`);
        },
        headers: {
          "x-chat-session-id": activeSessionId,
        },
      });
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const result = streamText({
      model: google(modelName),
      system: systemPrompt,
      messages,
      onFinish: async (event) => {
        if (event.text && activeSessionId) {
          await addChatMessage(activeSessionId, "assistant", event.text).catch((e) =>
            console.error("Failed to save assistant response:", e)
          );
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "x-chat-session-id": activeSessionId,
      },
    });
  } catch (error: any) {
    console.error("AI Chatbot Safety Route Error:", error);
    return NextResponse.json(
      {
        error:
          "The AI assistant encountered a temporary service error. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
