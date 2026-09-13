import { z } from "zod";

// Enum schemas matching Prisma enums
export const RoleEnum = z.enum(["STUDENT", "FACULTY", "ADMIN"]);
export const AccountStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const PublicationStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const WingTypeEnum = z.enum(["NSS", "SPORTS_WING", "TECH_TEAM", "NCC"]);

// Authentication Schemas (USERNAME + PASSWORD)
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const studentSignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  registerNumber: z.string().min(3, "Register/Roll number is required"),
  batch: z.string().min(4, "Batch is required (e.g. 2026-2030)"),
});

export const facultyProvisionSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name is required"),
  designation: z.string().min(2, "Designation is required"),
  qualification: z.string().min(2, "Qualification is required"),
  bio: z.string().optional(),
  profilePhotoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Profile Schemas
export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  bio: z.string().max(1000, "Bio max 1000 characters").optional(),
  profilePhotoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateFacultyProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  designation: z.string().min(2, "Designation is required").optional(),
  qualification: z.string().min(2, "Qualification is required").optional(),
  bio: z.string().max(2000, "Bio max 2000 characters").optional(),
  profilePhotoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Project / Portfolio Schema
export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  projectUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
});

// Note / Academic Resource Schema
export const noteSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  semester: z.number().int().min(1).max(8),
  fileUrl: z.string().url("File URL must be a valid URL"),
  fileType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  subjectId: z.string().min(1, "Subject is required"),
});

// Event Schema
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventDate: z.coerce.date(),
  location: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: PublicationStatusEnum.default("PUBLISHED"),
});

// Gallery Item Schema
export const galleryItemSchema = z.object({
  imageUrl: z.string().url("Image URL must be a valid URL"),
  caption: z.string().max(300, "Caption max 300 characters").optional(),
  status: PublicationStatusEnum.default("PUBLISHED"),
});

// Admin Approval Schema
export const adminAccountApprovalSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["APPROVED", "REJECTED"]),
});

// Subject Schema
export const subjectSchema = z.object({
  code: z
    .string()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Subject code can only contain alphanumeric characters, underscores, and hyphens"),
  name: z.string().min(3, "Subject name must be at least 3 characters").max(120),
  description: z.string().optional(),
  semester: z.number().int().min(1).max(8),
});

// Subject-Faculty Assignment Schema
export const subjectAssignmentSchema = z.object({
  facultyId: z.string().min(1, "Faculty is required"),
  subjectId: z.string().min(1, "Subject is required"),
});

// Wing Schema
export const wingSchema = z.object({
  name: z.string().min(2, "Wing name is required"),
  type: WingTypeEnum,
  description: z.string().optional(),
});

// Admin Moderation Schemas
export const updateProjectAdminSchema = z.object({
  isFeatured: z.boolean().optional(),
});

export const updateGalleryAdminSchema = z.object({
  caption: z.string().max(300).optional(),
  status: PublicationStatusEnum.optional(),
});

// Types inferred from Zod schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type FacultyProvisionInput = z.infer<typeof facultyProvisionSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateFacultyProfileInput = z.infer<typeof updateFacultyProfileSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type AdminAccountApprovalInput = z.infer<typeof adminAccountApprovalSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type SubjectAssignmentInput = z.infer<typeof subjectAssignmentSchema>;
export type WingInput = z.infer<typeof wingSchema>;
export type UpdateProjectAdminInput = z.infer<typeof updateProjectAdminSchema>;
export type UpdateGalleryAdminInput = z.infer<typeof updateGalleryAdminSchema>;

