import { db } from "@/lib/db";
import { ProjectInput } from "@/lib/validations";

export async function getProjectsByStudentId(studentId: string) {
  return db.project.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProjects() {
  return db.project.findMany({
    where: { isFeatured: true },
    include: {
      student: {
        select: {
          fullName: true,
          batch: true,
          registerNumber: true,
          profilePhotoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(studentId: string, input: ProjectInput) {
  if (input.isFeatured) {
    // Un-feature other projects of this student to maintain single primary featured project
    await db.project.updateMany({
      where: { studentId, isFeatured: true },
      data: { isFeatured: false },
    });
  }

  return db.project.create({
    data: {
      studentId,
      title: input.title.trim(),
      description: input.description.trim(),
      projectUrl: input.projectUrl?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      isFeatured: Boolean(input.isFeatured),
    },
  });
}

export async function updateStudentProject(
  projectId: string,
  studentId: string,
  input: Partial<ProjectInput>
) {
  const existing = await db.project.findFirst({
    where: { id: projectId, studentId },
  });
  if (!existing) {
    throw new Error("Project not found or user unauthorized to edit");
  }

  if (input.isFeatured) {
    // Un-feature other projects of this student
    await db.project.updateMany({
      where: { studentId, isFeatured: true, id: { not: projectId } },
      data: { isFeatured: false },
    });
  }

  const updateData = {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() } : {}),
    ...(input.projectUrl !== undefined ? { projectUrl: input.projectUrl?.trim() || null } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl?.trim() || null } : {}),
    ...(input.isFeatured !== undefined ? { isFeatured: Boolean(input.isFeatured) } : {}),
  };

  return db.project.update({
    where: { id: projectId },
    data: updateData,
  });
}

export async function deleteStudentProject(projectId: string, studentId: string) {
  const existing = await db.project.findFirst({
    where: { id: projectId, studentId },
  });
  if (!existing) {
    throw new Error("Project not found or user unauthorized to delete");
  }

  return db.project.delete({
    where: { id: projectId },
  });
}
