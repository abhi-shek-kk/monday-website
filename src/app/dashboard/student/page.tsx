import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStudentFullProfile, getWingsWithStudentStatus } from "@/lib/services/student.service";
import { getProjectsByStudentId } from "@/lib/services/project.service";
import { getNotes } from "@/lib/services/note.service";
import { db } from "@/lib/db";
import StudentPortalClient from "@/components/StudentPortalClient";

export default async function StudentDashboardPage() {
  const session = await getSession();

  // Guard: Mandatory server-side authorization check (role = STUDENT and status = APPROVED)
  if (!session || session.role !== "STUDENT" || session.status !== "APPROVED") {
    redirect("/login");
  }

  const { user } = session;
  const fullUser = await getStudentFullProfile(user.id);

  if (!fullUser || !fullUser.studentProfile) {
    redirect("/login");
  }

  const studentProfileId = fullUser.studentProfile.id;

  // Query real data from PostgreSQL
  const [projects, wings, notes, subjects] = await Promise.all([
    getProjectsByStudentId(studentProfileId).catch(() => []),
    getWingsWithStudentStatus(studentProfileId).catch(() => []),
    getNotes().catch(() => []),
    db.subject.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        semester: true,
      },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    }).catch(() => []),
  ]);

  return (
    <StudentPortalClient
      user={fullUser}
      initialProjects={JSON.parse(JSON.stringify(projects))}
      initialWings={JSON.parse(JSON.stringify(wings))}
      initialNotes={JSON.parse(JSON.stringify(notes))}
      initialSubjects={JSON.parse(JSON.stringify(subjects))}
    />
  );
}
