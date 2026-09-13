import { db } from "@/lib/db";
import { Role, AccountStatus } from "@prisma/client";
import { StudentSignupInput, FacultyProvisionInput } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function findUserByUsername(username: string) {
  return db.user.findUnique({
    where: { username },
    include: {
      studentProfile: true,
      facultyProfile: true,
    },
  });
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      facultyProfile: true,
    },
  });
}

export async function registerStudentUser(input: StudentSignupInput) {
  const existingUsername = await db.user.findUnique({
    where: { username: input.username },
  });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  const existingRegisterNumber = await db.studentProfile.findUnique({
    where: { registerNumber: input.registerNumber },
  });
  if (existingRegisterNumber) {
    throw new Error("Register / Roll number already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return db.user.create({
    data: {
      username: input.username,
      passwordHash,
      email: input.email && input.email.trim() !== "" ? input.email : null,
      role: Role.STUDENT,
      status: AccountStatus.PENDING, // Requirement: Student signup is PENDING until admin approval
      studentProfile: {
        create: {
          fullName: input.fullName,
          registerNumber: input.registerNumber,
          batch: input.batch,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });
}

export async function provisionFacultyUser(input: FacultyProvisionInput) {
  const existingUsername = await db.user.findUnique({
    where: { username: input.username },
  });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return db.user.create({
    data: {
      username: input.username,
      passwordHash,
      email: input.email && input.email.trim() !== "" ? input.email : null,
      role: Role.FACULTY,
      status: AccountStatus.APPROVED, // Requirement: Faculty provisioned directly by Admin
      facultyProfile: {
        create: {
          fullName: input.fullName,
          designation: input.designation,
          qualification: input.qualification,
          bio: input.bio,
          profilePhotoUrl: input.profilePhotoUrl,
        },
      },
    },
    include: {
      facultyProfile: true,
    },
  });
}

export async function updateAccountStatus(userId: string, status: AccountStatus) {
  return db.user.update({
    where: { id: userId },
    data: { status },
  });
}

export async function getPendingStudentApprovals() {
  return db.user.findMany({
    where: {
      role: Role.STUDENT,
      status: AccountStatus.PENDING,
    },
    include: {
      studentProfile: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
