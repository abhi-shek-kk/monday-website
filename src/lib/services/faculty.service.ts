import { db } from "@/lib/db";
import { AccountStatus, Role } from "@prisma/client";

export async function getPublicFacultyProfiles() {
  return db.user.findMany({
    where: {
      role: Role.FACULTY,
      status: AccountStatus.APPROVED,
    },
    include: {
      facultyProfile: {
        include: {
          subjects: {
            include: {
              subject: {
                select: {
                  code: true,
                  name: true,
                  semester: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export function compareRollNumbers(aStr?: string | null, bStr?: string | null): number {
  if (!aStr && !bStr) return 0;
  if (!aStr) return 1;  // Missing/invalid roll numbers at the end
  if (!bStr) return -1; // Missing/invalid roll numbers at the end

  const a = aStr.trim();
  const b = bStr.trim();

  const aNum = Number(a);
  const bNum = Number(b);

  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export async function getPublicStudentProfiles(
  batchFilter?: string,
  userRole?: string | Role | null
) {
  const normalizedRole = userRole ? String(userRole).toUpperCase() : null;
  const allowedRoles = [Role.STUDENT, Role.FACULTY, Role.ADMIN];
  if (!normalizedRole || !allowedRoles.includes(normalizedRole as Role)) {
    return [];
  }

  const students = await db.user.findMany({
    where: {
      role: Role.STUDENT,
      status: AccountStatus.APPROVED,
      ...(batchFilter && batchFilter !== "ALL"
        ? {
            studentProfile: {
              batch: batchFilter,
            },
          }
        : {}),
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      studentProfile: {
        select: {
          id: true,
          fullName: true,
          registerNumber: true,
          batch: true,
          bloodGroup: true,
          dateOfBirth: true,
          bio: true,
          profilePhotoUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          websiteUrl: true,
          projects: {
            select: {
              id: true,
              title: true,
              description: true,
              projectUrl: true,
              imageUrl: true,
              isFeatured: true,
            },
          },
          wingMemberships: {
            include: {
              wing: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return students.sort((a: any, b: any) =>
    compareRollNumbers(a.studentProfile?.registerNumber, b.studentProfile?.registerNumber)
  );
}

export async function getStudentBatches(userRole?: string | Role | null) {
  const normalizedRole = userRole ? String(userRole).toUpperCase() : null;
  const allowedRoles = [Role.STUDENT, Role.FACULTY, Role.ADMIN];
  if (!normalizedRole || !allowedRoles.includes(normalizedRole as Role)) {
    return [];
  }

  const profiles = await db.studentProfile.findMany({
    select: {
      batch: true,
    },
    distinct: ["batch"],
  });

  return Array.from(new Set(profiles.map((p: { batch: string }) => p.batch))).sort();
}

export async function getFacultyDashboardData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      facultyProfile: {
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
          notes: {
            include: {
              subject: {
                select: { code: true, name: true, semester: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user || !user.facultyProfile) {
    throw new Error("Faculty profile not found");
  }

  const allSubjects = await db.subject.findMany({
    orderBy: [{ semester: "asc" }, { code: "asc" }],
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    profile: user.facultyProfile,
    assignedSubjects: user.facultyProfile.subjects.map((sf: { subject: unknown }) => sf.subject),
    allSubjects,
    notes: user.facultyProfile.notes,
  };
}

export async function updateFacultyProfileSelf(
  userId: string,
  input: {
    fullName?: string;
    designation?: string;
    qualification?: string;
    bio?: string;
    profilePhotoUrl?: string;
  }
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { facultyProfile: { select: { id: true } } },
  });

  if (!user || !user.facultyProfile) {
    throw new Error("Faculty profile not found");
  }

  const updateData = {
    ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
    ...(input.designation ? { designation: input.designation.trim() } : {}),
    ...(input.qualification ? { qualification: input.qualification.trim() } : {}),
    ...(input.bio !== undefined ? { bio: input.bio?.trim() || null } : {}),
    ...(input.profilePhotoUrl !== undefined
      ? { profilePhotoUrl: input.profilePhotoUrl?.trim() || null }
      : {}),
  };

  return db.facultyProfile.update({
    where: { id: user.facultyProfile.id },
    data: updateData,
  });
}

