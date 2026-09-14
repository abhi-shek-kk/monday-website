import { db } from "@/lib/db";
import { UpdateStudentProfileInput } from "@/lib/validations";

export async function getStudentFullProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      studentProfile: {
        include: {
          projects: {
            orderBy: { createdAt: "desc" },
          },
          wingMemberships: {
            include: {
              wing: true,
            },
          },
        },
      },
    },
  });
}

export async function updateStudentProfile(userId: string, input: UpdateStudentProfileInput) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { studentProfile: { select: { id: true } } },
  });

  if (!user || !user.studentProfile) {
    throw new Error("Student profile not found");
  }

  // Clean empty strings to null or undefined for optional URLs and fields
  const cleanData = {
    ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
    ...(input.bloodGroup !== undefined ? { bloodGroup: input.bloodGroup.trim() || null } : {}),
    ...(input.dateOfBirth !== undefined
      ? { dateOfBirth: input.dateOfBirth && input.dateOfBirth.trim() ? new Date(input.dateOfBirth.trim()) : null }
      : {}),
    ...(input.bio !== undefined ? { bio: input.bio.trim() } : {}),
    ...(input.profilePhotoUrl !== undefined ? { profilePhotoUrl: input.profilePhotoUrl.trim() || null } : {}),
    ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl.trim() || null } : {}),
    ...(input.linkedinUrl !== undefined ? { linkedinUrl: input.linkedinUrl.trim() || null } : {}),
    ...(input.websiteUrl !== undefined ? { websiteUrl: input.websiteUrl.trim() || null } : {}),
  };

  return db.studentProfile.update({
    where: { id: user.studentProfile.id },
    data: cleanData,
  });
}

export async function getWingsWithStudentStatus(studentId: string) {
  const wings = await db.wing.findMany({
    orderBy: { name: "asc" },
  });

  const memberships = await db.studentWingMembership.findMany({
    where: { studentId },
    select: { wingId: true },
  });

  const joinedWingIds = new Set(memberships.map((m: { wingId: string }) => m.wingId));

  return wings.map((wing: { id: string; name: string; type: string; description: string | null }) => ({
    ...wing,
    isJoined: joinedWingIds.has(wing.id),
  }));
}

export async function toggleWingMembership(studentId: string, wingId: string, action?: "join" | "leave") {
  const wing = await db.wing.findUnique({
    where: { id: wingId },
  });
  if (!wing) {
    throw new Error("Wing not found");
  }

  const existing = await db.studentWingMembership.findUnique({
    where: {
      studentId_wingId: {
        studentId,
        wingId,
      },
    },
  });

  if (action === "leave" || (action === undefined && existing)) {
    if (existing) {
      await db.studentWingMembership.delete({
        where: { id: existing.id },
      });
    }
    return { joined: false, wingId };
  } else {
    if (!existing) {
      await db.studentWingMembership.create({
        data: {
          studentId,
          wingId,
          roleInWing: "Member",
        },
      });
    }
    return { joined: true, wingId };
  }
}
