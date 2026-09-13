import { NextResponse } from "next/server";
import { streamText, createDataStreamResponse } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createChatSession, addChatMessage, getChatSessionWithMessages } from "@/lib/services/chat.service";

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

// Rate limiting map per IP (max 15 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (limit.count >= 15) {
    return false;
  }
  limit.count += 1;
  return true;
}

/**
 * Explicit Privacy & Security Guard to block requests for passwords,
 * credentials, JWT secrets, database connection strings, or private profiles.
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

  // Pattern checks for private student profiles, personal contact info, register numbers
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

    const { messages: incomingMessages, sessionId: providedSessionId } = parseResult.data;
    const lastUserMessage = incomingMessages[incomingMessages.length - 1];

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

    // 4. Manage Session & Log Messages (Multi-turn History)
    let activeSessionId: string = providedSessionId || "";
    let historyMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    if (!activeSessionId) {
      const newSession = await createChatSession(currentUserId);
      activeSessionId = newSession.id;
    } else {
      const dbSession = await getChatSessionWithMessages(activeSessionId).catch(() => null);
      if (dbSession && dbSession.messages && dbSession.messages.length > 0) {
        // Take last 10 historical messages for multi-turn awareness
        historyMessages = dbSession.messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
      }
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

    // 6. SERVER-SIDE POSTGRESQL DATABASE KNOWLEDGE RETRIEVAL
    // ALLOWLIST SOURCE 1: Public Subjects / Courses
    const subjects = await db.subject.findMany({
      select: { code: true, name: true, semester: true, description: true },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });

    // ALLOWLIST SOURCE 2: Academic Notes Metadata
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
              `- [Sem ${n.semester}] Note "${n.title}" for ${n.subject.code} (${n.subject.name}). Available via Student/Faculty portal.`
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

    // ALLOWLIST SOURCE 5: Faculty Directory
    const facultyList = await db.facultyProfile.findMany({
      select: { fullName: true, designation: true, qualification: true, bio: true },
      take: 10,
    });

    // ALLOWLIST SOURCE 6: Public Projects Showcase
    const projectsList = await db.project.findMany({
      select: { title: true, description: true, projectUrl: true },
      take: 10,
    }).catch(() => []);

    // Construct grounded context from database allowlist sources
    const allowlistContext = `
==================================================
EXPLICIT DEPARTMENT KNOWLEDGE BASE (POSTGRESQL DB)
==================================================
INSTITUTION: St. Berchmans College, Changanassery, Kottayam District, Kerala.
DEPARTMENT: Department of Artificial Intelligence & Data Science.
PROGRAM: BSc Artificial Intelligence & Data Science (4-Year Degree / 8 Semesters).
FIRST BATCH COHORT: 2026–2030.

COURSES & SYLLABUS (${subjects.length} courses):
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

FACULTY DIRECTORY (${facultyList.length} faculty members):
${
  facultyList.length > 0
    ? facultyList.map((f: { fullName: string; designation: string; qualification: string }) => `- ${f.fullName} (${f.designation}, ${f.qualification})`).join("\n")
    : "Faculty information available on official faculty page."
}

PUBLISHED EVENTS (${eventsList.length} events):
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

CO-CURRICULAR WINGS:
${
  wingsList.length > 0
    ? wingsList.map((w: { name: string; type: string; description: string | null }) => `- ${w.name} (${w.type}): ${w.description || "Active organization"}`).join("\n")
    : "- NSS Wing: Community Service\n- Tech Team: Software Development & Hackathons\n- Sports Wing: Athletics & Fitness\n- NCC Wing: Leadership Cadet Corps"
}

STUDENT SHOWCASE PROJECTS (${projectsList.length} projects):
${
  projectsList.length > 0
    ? projectsList.map((p: { title: string; description: string }) => `- ${p.title}: ${p.description}`).join("\n")
    : "No public student projects showcased yet."
}

ACADEMIC NOTES METADATA:
${notesMetadataText}
==================================================
`;

    const systemPrompt = `You are Mr. Melbin, the official AI Information Assistant for the Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery.

PERSONALITY & KNOWLEDGE SCOPE:
- You are a helpful, friendly, natural, and knowledgeable conversational AI assistant.
- GENERAL AI KNOWLEDGE: You have full conversational AI capabilities to answer general education, computer science, programming (Python, Java, C++, SQL), machine learning, artificial intelligence, science, or general conversational questions freely and naturally.
- DEPARTMENT KNOWLEDGE: For questions specific to St. Berchmans College or the Department of AI & Data Science (curriculum, course codes, faculty, events, wings), rely on the verified PostgreSQL database knowledge base provided below.
- RECENT & LIVE INFORMATION: When answering questions about current events, versions, or news, utilize web search grounding if available and cite clean Markdown sources.
- CONVERSATIONAL FLOW: You remember previous messages in the conversation session. Maintain natural multi-turn context (e.g. if the user asks "which one is related to AI?" after discussing Semester 1 courses, answer based on the previous context).

CRITICAL SECURITY & PRIVACY RESTRICTIONS:
- You MUST NOT retrieve, summarize, expose, or reveal passwords, JWT secrets, database credentials, internal database IDs, raw MediaFile records, or private Cloudinary storage URLs.
- If asked for credentials, passwords, or system configurations, state: "I cannot provide password, credential, or system configuration information."
- If an unauthenticated user requests protected academic note downloads, inform them that protected downloads require an approved student/faculty account.

${allowlistContext}`;

    // Combine history messages with incoming user message for multi-turn awareness
    const combinedMessages = [...historyMessages, ...incomingMessages];

    // 7. Call Gemini AI API via SDK with Search Grounding
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey || apiKey === "demo_gemini_key") {
      // SMART GROUNDED & GENERAL CONVERSATIONAL ENGINE FOR OFFLINE / DEMO KEYS
      const q = trimmedUserMessage.toLowerCase();
      let responseContent = "";

      // 1. General CS / Machine Learning / Programming questions
      if (q.includes("what is machine learning") || q.includes("machine learning")) {
        responseContent = "Machine Learning (ML) is a branch of Artificial Intelligence (AI) and computer science that focuses on using data and algorithms to enable software applications to become more accurate in predicting outcomes without being explicitly programmed.";
      } else if (q.includes("python")) {
        responseContent = "Python is a high-level, interpreted programming language known for its clear syntax and readability. It is widely used in data science, artificial intelligence, web development, and automation.";
      } else if (q.includes("difference between ai and data science") || (q.includes("ai") && q.includes("data science"))) {
        responseContent = "Artificial Intelligence (AI) focuses on creating intelligent agents that can perform tasks requiring human-like intelligence (such as reasoning and problem solving). Data Science involves extracting insights and actionable knowledge from data using statistics, data analysis, and machine learning techniques. Data Science often uses AI and ML as tools.";
      } else if (q.includes("neural network")) {
        responseContent = "A neural network is a machine learning model inspired by the structure and function of the human brain. It consists of interconnected layers of nodes (neurons) that process inputs to learn patterns and make predictions.";
      } else if (q.includes("photosynthesis")) {
        responseContent = "Photosynthesis is the biological process used by green plants and certain organisms to convert light energy (sunlight) into chemical energy stored in glucose, releasing oxygen as a byproduct.";
      }
      // 2. Department & College specific queries from Database Allowlist
      else if (q.includes("course") || q.includes("semester") || q.includes("sem") || q.includes("subject")) {
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
      } else if (q.includes("faculty") || q.includes("teacher") || q.includes("professor")) {
        responseContent = facultyList.length > 0
          ? `Department faculty members:\n` + facultyList.map((f: { fullName: string; designation: string; qualification: string }) => `- **${f.fullName}**: ${f.designation} (${f.qualification})`).join("\n")
          : "Our department features experienced faculty specializing in AI, Machine Learning, and Data Analytics.";
      } else if (q.includes("project")) {
        responseContent = projectsList.length > 0
          ? `Student Showcase Projects:\n` + projectsList.map((p: { title: string; description: string; tags?: string }) => `- **${p.title}**${p.tags ? ` [${p.tags}]` : ""}: ${p.description}`).join("\n")
          : "Student projects feature innovative work in Machine Learning, Computer Vision, and Web Development.";
      } else if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("who are you")) {
        responseContent = "Hello! I am Mr. Melbin, the official AI assistant for the Department of Artificial Intelligence & Data Science at St. Berchmans College. How can I help you with our curriculum, subjects, faculty, events, or general AI topics today?";
      } else {
        responseContent = "Hello! I am Mr. Melbin, your AI Assistant. I can help answer questions about our BSc AI & Data Science program, semester subjects, faculty directory, events, or general computer science and artificial intelligence topics.";
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

    // LIVE GEMINI MODEL EXECUTION WITH SEARCH GROUNDING & TOOLS
    const googleProvider = createGoogleGenerativeAI({
      apiKey,
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const result = streamText({
      model: googleProvider(modelName, { useSearchGrounding: true }),
      system: systemPrompt,
      messages: combinedMessages,
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

