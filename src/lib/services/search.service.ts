import { db } from "@/lib/db";
import { AccountStatus, PublicationStatus } from "@prisma/client";

export interface SearchResults {
  courses: Array<{
    id: string;
    code: string;
    name: string;
    semester: number;
    description: string | null;
  }>;
  faculty: Array<{
    id: string;
    fullName: string;
    designation: string;
    qualification: string;
    bio: string | null;
  }>;
  students: Array<{
    id: string;
    fullName: string;
    registerNumber: string;
    batch: string;
    bio: string | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    studentName: string;
    batch: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    location: string | null;
  }>;
  notes: Array<{
    id: string;
    title: string;
    description: string | null;
    semester: number;
    subjectCode: string;
    subjectName: string;
    uploaderName: string;
  }>;
}

export async function searchPublicContent(query: string, userRole?: string | null): Promise<SearchResults> {
  const q = query.trim();

  if (!q) {
    return {
      courses: [],
      faculty: [],
      students: [],
      projects: [],
      events: [],
      notes: [],
    };
  }

  const normalizedRole = userRole ? String(userRole).toUpperCase() : null;
  const canAccessStudentProfiles = Boolean(
    normalizedRole && ["STUDENT", "FACULTY", "ADMIN"].includes(normalizedRole)
  );

  const [courses, facultyProfiles, studentProfiles, projects, events, notes] = await Promise.all([
    // Courses / Subjects
    db.subject.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),

    // Faculty Profiles
    db.facultyProfile.findMany({
      where: {
        user: {
          status: AccountStatus.APPROVED,
        },
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { designation: { contains: q, mode: "insensitive" } },
          { qualification: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),

    // Approved Student Profiles (Restricted to STUDENT, FACULTY, ADMIN)
    canAccessStudentProfiles
      ? db.studentProfile.findMany({
          where: {
            user: {
              status: AccountStatus.APPROVED,
            },
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { registerNumber: { contains: q, mode: "insensitive" } },
              { batch: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 10,
        })
      : Promise.resolve([]),

    // Projects
    db.project.findMany({
      where: {
        student: {
          user: {
            status: AccountStatus.APPROVED,
          },
        },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        student: {
          select: {
            fullName: true,
            batch: true,
          },
        },
      },
      take: 10,
    }),

    // Events
    db.event.findMany({
      where: {
        status: PublicationStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),

    // Notes
    db.note.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        subject: {
          select: {
            code: true,
            name: true,
          },
        },
        uploader: {
          select: {
            fullName: true,
          },
        },
      },
      take: 10,
    }),
  ]);

  return {
    courses,
    faculty: facultyProfiles,
    students: studentProfiles,
    projects: projects.map((p: { id: string; title: string; description: string; student: { fullName: string; batch: string } }) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      studentName: p.student.fullName,
      batch: p.student.batch,
    })),
    events,
    notes: notes.map((n: { id: string; title: string; description: string | null; semester: number; subject: { code: string; name: string }; uploader: { fullName: string } }) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      semester: n.semester,
      subjectCode: n.subject.code,
      subjectName: n.subject.name,
      uploaderName: n.uploader.fullName,
    })),
  };
}
