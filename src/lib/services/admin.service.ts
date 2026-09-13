import { db } from "@/lib/db";
import { Role, AccountStatus, PublicationStatus } from "@prisma/client";
import {
  SubjectInput,
  WingInput,
  UpdateFacultyProfileInput,
} from "@/lib/validations";

// 1. Overview Statistics (Real database counts)
export async function getAdminOverviewStats() {
  const [
    totalStudents,
    pendingStudents,
    approvedStudents,
    facultyCount,
    subjectCount,
    projectCount,
    publishedEvents,
    publishedGallery,
    notesCount,
    wingCount,
  ] = await Promise.all([
    db.user.count({ where: { role: Role.STUDENT } }),
    db.user.count({ where: { role: Role.STUDENT, status: AccountStatus.PENDING } }),
    db.user.count({ where: { role: Role.STUDENT, status: AccountStatus.APPROVED } }),
    db.user.count({ where: { role: Role.FACULTY } }),
    db.subject.count(),
    db.project.count(),
    db.event.count({ where: { status: PublicationStatus.PUBLISHED } }),
    db.galleryItem.count({ where: { status: PublicationStatus.PUBLISHED } }),
    db.note.count(),
    db.wing.count(),
  ]);

  return {
    totalStudents,
    pendingStudents,
    approvedStudents,
    facultyCount,
    subjectCount,
    projectCount,
    publishedEvents,
    publishedGallery,
    notesCount,
    wingCount,
  };
}

// 2. Student Management
export async function getAdminStudentsList(params?: {
  query?: string;
  batch?: string;
  status?: AccountStatus;
}) {
  const { query, batch, status } = params || {};

  return db.user.findMany({
    where: {
      role: Role.STUDENT,
      ...(status ? { status } : {}),
      ...(batch
        ? {
            studentProfile: {
              batch,
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              {
                studentProfile: {
                  fullName: { contains: query, mode: "insensitive" },
                },
              },
              {
                studentProfile: {
                  registerNumber: { contains: query, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      studentProfile: {
        include: {
          projects: {
            select: { id: true, title: true, isFeatured: true },
          },
          wingMemberships: {
            include: { wing: { select: { name: true, type: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteStudentAdmin(userId: string) {
  // Ensure target user is a STUDENT
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) {
    throw new Error("Student account not found");
  }
  if (target.role !== Role.STUDENT) {
    throw new Error("Cannot delete non-student accounts via student management.");
  }

  return db.user.delete({
    where: { id: userId },
  });
}

// 3. Faculty Management
export async function getAdminFacultyList() {
  return db.user.findMany({
    where: { role: Role.FACULTY },
    include: {
      facultyProfile: {
        include: {
          subjects: {
            include: {
              subject: {
                select: { id: true, code: true, name: true, semester: true },
              },
            },
          },
          notes: {
            select: { id: true, title: true, semester: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateFacultyAdmin(
  facultyProfileId: string,
  input: UpdateFacultyProfileInput
) {
  const cleanData = {
    ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
    ...(input.designation ? { designation: input.designation.trim() } : {}),
    ...(input.qualification ? { qualification: input.qualification.trim() } : {}),
    ...(input.bio !== undefined ? { bio: input.bio?.trim() || null } : {}),
    ...(input.profilePhotoUrl !== undefined
      ? { profilePhotoUrl: input.profilePhotoUrl?.trim() || null }
      : {}),
  };

  return db.facultyProfile.update({
    where: { id: facultyProfileId },
    data: cleanData,
  });
}

// 4. Subject Management
export async function getAllSubjectsAdmin() {
  return db.subject.findMany({
    include: {
      faculties: {
        include: {
          faculty: {
            select: {
              id: true,
              fullName: true,
              designation: true,
            },
          },
        },
      },
      notes: {
        select: { id: true, title: true },
      },
    },
    orderBy: [{ semester: "asc" }, { code: "asc" }],
  });
}

export async function createSubjectAdmin(input: SubjectInput) {
  const existingCode = await db.subject.findUnique({
    where: { code: input.code.trim().toUpperCase() },
  });
  if (existingCode) {
    throw new Error(`Subject with code '${input.code.toUpperCase()}' already exists.`);
  }

  return db.subject.create({
    data: {
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      semester: input.semester,
    },
  });
}

export async function updateSubjectAdmin(subjectId: string, input: Partial<SubjectInput>) {
  if (input.code) {
    const existingCode = await db.subject.findFirst({
      where: { code: input.code.trim().toUpperCase(), id: { not: subjectId } },
    });
    if (existingCode) {
      throw new Error(`Subject with code '${input.code.toUpperCase()}' already exists.`);
    }
  }

  const updateData = {
    ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    ...(input.semester ? { semester: input.semester } : {}),
  };

  return db.subject.update({
    where: { id: subjectId },
    data: updateData,
  });
}

export async function deleteSubjectAdmin(subjectId: string) {
  return db.subject.delete({
    where: { id: subjectId },
  });
}

// 5. Subject-Faculty Assignment
export async function assignFacultyToSubject(facultyId: string, subjectId: string) {
  const existingAssignment = await db.subjectFaculty.findUnique({
    where: {
      facultyId_subjectId: {
        facultyId,
        subjectId,
      },
    },
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  return db.subjectFaculty.create({
    data: {
      facultyId,
      subjectId,
    },
  });
}

export async function removeFacultyFromSubject(facultyId: string, subjectId: string) {
  return db.subjectFaculty.deleteMany({
    where: {
      facultyId,
      subjectId,
    },
  });
}

// 6. Project Moderation
export async function getAdminProjects() {
  return db.project.findMany({
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          registerNumber: true,
          batch: true,
          user: {
            select: { username: true, status: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleProjectFeaturedAdmin(projectId: string, isFeatured: boolean) {
  return db.project.update({
    where: { id: projectId },
    data: { isFeatured },
  });
}

export async function deleteProjectAdmin(projectId: string) {
  return db.project.delete({
    where: { id: projectId },
  });
}

// 7. Event Management
export async function getAdminEvents() {
  return db.event.findMany({
    include: {
      createdBy: {
        select: { username: true, role: true },
      },
    },
    orderBy: { eventDate: "desc" },
  });
}

// 8. Gallery Management
export async function getAdminGalleryItems() {
  return db.galleryItem.findMany({
    include: {
      uploader: {
        select: { username: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGalleryItemAdmin(
  itemId: string,
  input: { caption?: string; status?: PublicationStatus }
) {
  return db.galleryItem.update({
    where: { id: itemId },
    data: {
      ...(input.caption !== undefined ? { caption: input.caption } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  });
}

// 9. Wings Management
export async function getAdminWings() {
  return db.wing.findMany({
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createWingAdmin(input: WingInput) {
  return db.wing.create({
    data: {
      name: input.name.trim(),
      type: input.type,
      description: input.description?.trim() || null,
    },
  });
}

export async function updateWingAdmin(wingId: string, input: Partial<WingInput>) {
  return db.wing.update({
    where: { id: wingId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    },
  });
}

// 10. Notes Oversight
export async function getAdminNotes() {
  return db.note.findMany({
    include: {
      subject: {
        select: { code: true, name: true, semester: true },
      },
      uploader: {
        select: { fullName: true, designation: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteNoteAdmin(noteId: string) {
  return db.note.delete({
    where: { id: noteId },
  });
}
