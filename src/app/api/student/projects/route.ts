import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProjectsByStudentId, createProject } from "@/lib/services/project.service";
import { projectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const studentProfileId = session.user.studentProfile?.id;
    if (!studentProfileId) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const projects = await getProjectsByStudentId(studentProfileId);

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Unauthorized access. Approved student login required." },
        { status: 401 }
      );
    }

    const studentProfileId = session.user.studentProfile?.id;
    if (!studentProfileId) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = projectSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Ownership guaranteed via session.user.studentProfile.id
    const newProject = await createProject(studentProfileId, parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create project." },
      { status: 500 }
    );
  }
}
