import { db } from "@/lib/db";
import { Role, AccountStatus } from "@prisma/client";

export interface CleanupReason {
  category: "DUPLICATE" | "DEMO_TEST" | "INCOMPLETE" | "UNUSED";
  description: string;
}

export interface CleanupProfileItem {
  id: string; // User ID
  username: string;
  email: string | null;
  role: Role;
  status: AccountStatus;
  createdAt: Date;
  profileId?: string;
  fullName: string;
  registerNumber?: string | null;
  batch?: string | null;
  designation?: string | null;
  qualification?: string | null;
  reasons: CleanupReason[];
  linkedItemsCount: {
    projects: number;
    notes: number;
    events: number;
    gallery: number;
    wings: number;
  };
}

const DEMO_KEYWORDS = [
  "test",
  "demo",
  "dummy",
  "sample",
  "temp",
  "foo",
  "bar",
  "fake",
  "placeholder",
  "testing",
  "admin_test",
  "user_test",
];

export async function getAdminProfileCleanupList(): Promise<CleanupProfileItem[]> {
  const users = await db.user.findMany({
    include: {
      studentProfile: {
        include: {
          _count: {
            select: {
              projects: true,
              wingMemberships: true,
            },
          },
        },
      },
      facultyProfile: {
        include: {
          _count: {
            select: {
              notes: true,
              subjects: true,
            },
          },
        },
      },
      _count: {
        select: {
          eventsCreated: true,
          galleryItems: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Track occurrences for duplicate detection
  const usernameCounts = new Map<string, string[]>();
  const emailCounts = new Map<string, string[]>();
  const regNoCounts = new Map<string, string[]>();
  const fullNameCounts = new Map<string, string[]>();

  users.forEach((u: (typeof users)[number]) => {
    const lowerUser = u.username.trim().toLowerCase();
    if (!usernameCounts.has(lowerUser)) usernameCounts.set(lowerUser, []);
    usernameCounts.get(lowerUser)!.push(u.id);

    if (u.email) {
      const lowerEmail = u.email.trim().toLowerCase();
      if (!emailCounts.has(lowerEmail)) emailCounts.set(lowerEmail, []);
      emailCounts.get(lowerEmail)!.push(u.id);
    }

    const fullName =
      u.studentProfile?.fullName || u.facultyProfile?.fullName || null;
    if (fullName) {
      const lowerName = fullName.trim().toLowerCase();
      if (!fullNameCounts.has(lowerName)) fullNameCounts.set(lowerName, []);
      fullNameCounts.get(lowerName)!.push(u.id);
    }

    if (u.studentProfile?.registerNumber) {
      const lowerReg = u.studentProfile.registerNumber.trim().toLowerCase();
      if (!regNoCounts.has(lowerReg)) regNoCounts.set(lowerReg, []);
      regNoCounts.get(lowerReg)!.push(u.id);
    }
  });

  const cleanupItems: CleanupProfileItem[] = [];

  for (const u of users) {
    const reasons: CleanupReason[] = [];
    const lowerUser = u.username.trim().toLowerCase();
    const lowerEmail = u.email?.trim().toLowerCase() || "";
    const fullName =
      u.studentProfile?.fullName || u.facultyProfile?.fullName || "No Name Provided";
    const lowerName = fullName.trim().toLowerCase();
    const regNo = u.studentProfile?.registerNumber || null;
    const lowerReg = regNo?.trim().toLowerCase() || "";

    // 1. DUPLICATES DETECTION
    if ((usernameCounts.get(lowerUser)?.length || 0) > 1) {
      reasons.push({
        category: "DUPLICATE",
        description: `Duplicate username '${u.username}' shared across ${
          usernameCounts.get(lowerUser)!.length
        } accounts`,
      });
    }

    if (lowerEmail && (emailCounts.get(lowerEmail)?.length || 0) > 1) {
      reasons.push({
        category: "DUPLICATE",
        description: `Duplicate email '${u.email}' shared across ${
          emailCounts.get(lowerEmail)!.length
        } accounts`,
      });
    }

    if (lowerReg && (regNoCounts.get(lowerReg)?.length || 0) > 1) {
      reasons.push({
        category: "DUPLICATE",
        description: `Duplicate register number '${regNo}' shared across ${
          regNoCounts.get(lowerReg)!.length
        } students`,
      });
    }

    if (fullName !== "No Name Provided" && (fullNameCounts.get(lowerName)?.length || 0) > 1) {
      reasons.push({
        category: "DUPLICATE",
        description: `Duplicate full name '${fullName}' matches ${
          fullNameCounts.get(lowerName)!.length
        } profiles`,
      });
    }

    // 2. DEMO / TEST ACCOUNT DETECTION
    const isDemoKeyword = DEMO_KEYWORDS.some(
      (kw) =>
        lowerUser.includes(kw) ||
        lowerEmail.includes(kw) ||
        lowerName.includes(kw) ||
        lowerReg.includes(kw)
    );
    if (isDemoKeyword) {
      reasons.push({
        category: "DEMO_TEST",
        description: `Identified test/demo profile pattern in username or details`,
      });
    }

    // 3. INCOMPLETE PROFILES DETECTION
    if (u.role === Role.STUDENT) {
      if (!u.studentProfile) {
        reasons.push({
          category: "INCOMPLETE",
          description: `Student user account is missing linked Student Profile`,
        });
      } else if (
        !u.studentProfile.registerNumber ||
        u.studentProfile.registerNumber.trim() === "" ||
        !u.studentProfile.batch ||
        u.studentProfile.batch.trim() === ""
      ) {
        reasons.push({
          category: "INCOMPLETE",
          description: `Incomplete student record (missing register number or batch)`,
        });
      }
    } else if (u.role === Role.FACULTY) {
      if (!u.facultyProfile) {
        reasons.push({
          category: "INCOMPLETE",
          description: `Faculty user account is missing linked Faculty Profile`,
        });
      } else if (
        !u.facultyProfile.designation ||
        u.facultyProfile.designation.trim() === "" ||
        !u.facultyProfile.qualification ||
        u.facultyProfile.qualification.trim() === ""
      ) {
        reasons.push({
          category: "INCOMPLETE",
          description: `Incomplete faculty record (missing designation or qualification)`,
        });
      }
    }

    // 4. UNUSED / UNAPPROVED ACCOUNTS
    const projectsCount = u.studentProfile?._count.projects || 0;
    const notesCount = u.facultyProfile?._count.notes || 0;
    const eventsCount = u._count.eventsCreated || 0;
    const galleryCount = u._count.galleryItems || 0;
    const wingsCount = u.studentProfile?._count.wingMemberships || 0;
    const totalActivity =
      projectsCount + notesCount + eventsCount + galleryCount + wingsCount;

    const daysOld = Math.floor(
      (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (u.status === AccountStatus.REJECTED) {
      reasons.push({
        category: "UNUSED",
        description: `Rejected registration account (${daysOld} days old)`,
      });
    } else if (u.status === AccountStatus.PENDING && daysOld >= 7) {
      reasons.push({
        category: "UNUSED",
        description: `Pending unapproved registration for ${daysOld} days`,
      });
    } else if (totalActivity === 0 && daysOld >= 14 && u.role !== Role.ADMIN) {
      reasons.push({
        category: "UNUSED",
        description: `Inactive user account with zero recorded projects, notes, or activity`,
      });
    }

    // Only add to cleanup list if flagged with at least 1 reason
    if (reasons.length > 0) {
      cleanupItems.push({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        profileId: u.studentProfile?.id || u.facultyProfile?.id,
        fullName,
        registerNumber: u.studentProfile?.registerNumber || null,
        batch: u.studentProfile?.batch || null,
        designation: u.facultyProfile?.designation || null,
        qualification: u.facultyProfile?.qualification || null,
        reasons,
        linkedItemsCount: {
          projects: projectsCount,
          notes: notesCount,
          events: eventsCount,
          gallery: galleryCount,
          wings: wingsCount,
        },
      });
    }
  }

  return cleanupItems;
}

export async function deleteUserAdmin(targetUserId: string, currentAdminUserId: string) {
  if (targetUserId === currentAdminUserId) {
    throw new Error("Action denied: Cannot delete your own logged-in admin account.");
  }

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      username: true,
      role: true,
      studentProfile: { select: { fullName: true } },
      facultyProfile: { select: { fullName: true } },
    },
  });

  if (!targetUser) {
    throw new Error("Target user profile not found in database.");
  }

  const fullName =
    targetUser.studentProfile?.fullName ||
    targetUser.facultyProfile?.fullName ||
    targetUser.username;

  // Safely execute cascading delete on User record
  await db.user.delete({
    where: { id: targetUserId },
  });

  return {
    success: true,
    message: `User account '${targetUser.username}' (${fullName}) permanently deleted successfully.`,
    deletedUser: {
      username: targetUser.username,
      role: targetUser.role,
      fullName,
    },
  };
}
