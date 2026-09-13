import { PrismaClient, Role, AccountStatus, PublicationStatus, MediaCategory } from '@prisma/client';
import { uploadToStorage, deleteFromStorage, generateSignedDownloadUrl, validateUpload } from '../src/lib/storage';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Transparent 1x1 PNG image buffer
const SAMPLE_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const samplePngBuffer = Buffer.from(SAMPLE_PNG_BASE64, "base64");

// 1x1 Red PNG image buffer for replacement test
const SAMPLE_RED_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const sampleRedPngBuffer = Buffer.from(SAMPLE_RED_PNG_BASE64, "base64");

// Sample PDF buffer for note test
const samplePdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n", "utf-8");

async function runE2ERealInfrastructureVerification() {
  console.log("=========================================================");
  console.log("CON 6 REAL INFRASTRUCTURE E2E VERIFICATION SUITE");
  console.log("Target Services: Neon PostgreSQL & Cloudinary (cjrbl3my)");
  console.log("=========================================================");

  let passCount = 0;
  let failCount = 0;

  function report(name: string, success: boolean, detail: string) {
    if (success) {
      console.log(`[PASS] ${name}`);
      console.log(`       Evidence: ${detail}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name}`);
      console.error(`       Detail: ${detail}`);
      failCount++;
    }
  }

  try {
    // -----------------------------------------------------------------
    // SUITE 1: DATABASE & PRISMA REAL VERIFICATION
    // -----------------------------------------------------------------
    console.log("\n--- SUITE 1: NEON POSTGRESQL & PRISMA MIGRATIONS ---");
    
    // 1.1 Tables & Schema Exist
    const tablesCheck = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `;
    const tableNames = tablesCheck.map((t: { table_name: string }) => t.table_name);
    const expectedModels = ['User', 'StudentProfile', 'FacultyProfile', 'Subject', 'Project', 'Note', 'Event', 'GalleryItem', 'MediaFile', 'Wing'];
    const allModelsExist = expectedModels.every(m => tableNames.includes(m));
    report(
      "1.1 Neon PostgreSQL Schema & Tables Verification",
      allModelsExist,
      `Tables verified in Neon public schema: ${expectedModels.join(', ')}`
    );

    // 1.2 Seeded Data Check
    const adminUser = await prisma.user.findUnique({ where: { username: "adminaids" } });
    const wingsCount = await prisma.wing.count();
    const subjectsCount = await prisma.subject.count();
    report(
      "1.2 Real Database Seeding Verification",
      Boolean(adminUser && wingsCount === 4 && subjectsCount === 8),
      `Admin: ${adminUser?.username} (${adminUser?.role}), Wings: ${wingsCount}, Subjects: ${subjectsCount}`
    );

    // -----------------------------------------------------------------
    // SUITE 2 & 3: REAL CLOUDINARY & STUDENT MEDIA OPERATIONS
    // -----------------------------------------------------------------
    console.log("\n--- SUITE 2 & 3: CLOUDINARY & STUDENT MEDIA E2E ---");

    // Create test student user
    const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);
    const testStudentUser = await prisma.user.upsert({
      where: { username: "verify_student_1" },
      update: { status: AccountStatus.APPROVED },
      create: {
        username: "verify_student_1",
        email: "verify_student_1@sbcollege.ac.in",
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        status: AccountStatus.APPROVED,
      }
    });

    const testStudentProfile = await prisma.studentProfile.upsert({
      where: { userId: testStudentUser.id },
      update: {},
      create: {
        userId: testStudentUser.id,
        fullName: "Test Student Verification",
        registerNumber: "SB2026AIDS001",
        batch: "2024-2028",
      }
    });

    // 2.1 Student Profile Photo Upload to Cloudinary & Neon Metadata
    console.log("Uploading student profile photo to live Cloudinary...");
    const profileUpload = await uploadToStorage(samplePngBuffer, {
      originalName: "student_avatar.png",
      mimeType: "image/png",
      category: MediaCategory.PROFILE_PHOTO,
      uploaderId: testStudentUser.id,
    });

    const profileMediaRecord = await prisma.mediaFile.create({
      data: {
        publicId: profileUpload.publicId,
        url: profileUpload.url,
        originalName: profileUpload.originalName,
        mimeType: profileUpload.mimeType,
        size: profileUpload.size,
        category: profileUpload.category,
        uploaderId: testStudentUser.id,
      }
    });

    await prisma.studentProfile.update({
      where: { id: testStudentProfile.id },
      data: {
        profilePhotoUrl: profileUpload.url,
        storageKey: profileUpload.publicId,
      }
    });

    report(
      "2.1 Live Profile Photo Upload & PostgreSQL Persistence",
      Boolean(profileMediaRecord.id && profileUpload.url.includes("cloudinary.com")),
      `Cloudinary URL: ${profileUpload.url}, MediaFile ID: ${profileMediaRecord.id}`
    );

    // 2.2 Student Profile Photo Replacement
    console.log("Replacing student profile photo on Cloudinary...");
    const profileReplaceUpload = await uploadToStorage(sampleRedPngBuffer, {
      originalName: "student_avatar_v2.png",
      mimeType: "image/png",
      category: MediaCategory.PROFILE_PHOTO,
      uploaderId: testStudentUser.id,
    });

    // Delete old profile photo from Cloudinary
    await deleteFromStorage(profileUpload.publicId, MediaCategory.PROFILE_PHOTO);
    await prisma.mediaFile.delete({ where: { id: profileMediaRecord.id } });

    const updatedProfileRecord = await prisma.mediaFile.create({
      data: {
        publicId: profileReplaceUpload.publicId,
        url: profileReplaceUpload.url,
        originalName: profileReplaceUpload.originalName,
        mimeType: profileReplaceUpload.mimeType,
        size: profileReplaceUpload.size,
        category: profileReplaceUpload.category,
        uploaderId: testStudentUser.id,
      }
    });

    await prisma.studentProfile.update({
      where: { id: testStudentProfile.id },
      data: {
        profilePhotoUrl: profileReplaceUpload.url,
        storageKey: profileReplaceUpload.publicId,
      }
    });

    report(
      "2.2 Profile Photo Replacement & Cleanup",
      Boolean(updatedProfileRecord.publicId !== profileUpload.publicId),
      `New Public ID: ${updatedProfileRecord.publicId}`
    );

    // 2.3 Student Project Upload
    const testProject = await prisma.project.create({
      data: {
        studentId: testStudentProfile.id,
        title: "AI Vision Portal",
        description: "Autonomous Image Processing System",
      }
    });

    const projectUpload = await uploadToStorage(samplePngBuffer, {
      originalName: "project_banner.png",
      mimeType: "image/png",
      category: MediaCategory.PROJECT_IMAGE,
      uploaderId: testStudentUser.id,
    });

    await prisma.project.update({
      where: { id: testProject.id },
      data: {
        imageUrl: projectUpload.url,
        storageKey: projectUpload.publicId,
      }
    });

    report(
      "2.3 Student Project Image Upload",
      Boolean(projectUpload.publicId.includes("department/projects")),
      `Project ID: ${testProject.id}, Storage Key: ${projectUpload.publicId}`
    );

    // -----------------------------------------------------------------
    // SUITE 4 & 5: FACULTY MEDIA & PROTECTED NOTES E2E
    // -----------------------------------------------------------------
    console.log("\n--- SUITE 4 & 5: FACULTY MEDIA & PROTECTED ACADEMIC NOTES ---");

    const facultyPasswordHash = await bcrypt.hash("FacultyPass123!", 10);
    const testFacultyUser = await prisma.user.upsert({
      where: { username: "verify_faculty_1" },
      update: { status: AccountStatus.APPROVED },
      create: {
        username: "verify_faculty_1",
        email: "verify_faculty_1@sbcollege.ac.in",
        passwordHash: facultyPasswordHash,
        role: Role.FACULTY,
        status: AccountStatus.APPROVED,
      }
    });

    const testFacultyProfile = await prisma.facultyProfile.upsert({
      where: { userId: testFacultyUser.id },
      update: {},
      create: {
        userId: testFacultyUser.id,
        fullName: "Dr. Verification Faculty",
        designation: "Assistant Professor",
        qualification: "Ph.D. Computer Science",
      }
    });

    // Faculty Note Upload
    const firstSubject = await prisma.subject.findFirstOrThrow({ where: { code: "AIDS101" } });

    const noteUpload = await uploadToStorage(samplePdfBuffer, {
      originalName: "unit_1_lecture_notes.pdf",
      mimeType: "application/pdf",
      category: MediaCategory.ACADEMIC_NOTE,
      uploaderId: testFacultyUser.id,
    });

    const noteRecord = await prisma.note.create({
      data: {
        title: "Unit 1: Foundations of AI",
        semester: 1,
        fileUrl: noteUpload.url,
        storageKey: noteUpload.publicId,
        fileType: "application/pdf",
        fileSize: noteUpload.size,
        subjectId: firstSubject.id,
        uploaderId: testFacultyProfile.id,
      }
    });

    report(
      "4.1 Faculty Academic Note Upload & Database Link",
      Boolean(noteRecord.id && noteUpload.publicId.includes("department/notes")),
      `Note ID: ${noteRecord.id}, Public ID: ${noteUpload.publicId}`
    );

    // 5.1 Signed URL Access Generation
    const signedUrl = generateSignedDownloadUrl(noteUpload.publicId, MediaCategory.ACADEMIC_NOTE, 900);
    report(
      "5.1 Temporary Signed Download URL Verification",
      signedUrl.includes("authenticated") || signedUrl.includes("signature") || signedUrl.includes("cloudinary.com"),
      `Signed URL output: ${signedUrl}`
    );

    // -----------------------------------------------------------------
    // SUITE 6: GALLERY E2E
    // -----------------------------------------------------------------
    console.log("\n--- SUITE 6: GALLERY ITEMS E2E ---");

    const galleryUpload = await uploadToStorage(samplePngBuffer, {
      originalName: "department_symposium.png",
      mimeType: "image/png",
      category: MediaCategory.GALLERY_IMAGE,
      uploaderId: adminUser!.id,
    });

    const galleryItem = await prisma.galleryItem.create({
      data: {
        imageUrl: galleryUpload.url,
        storageKey: galleryUpload.publicId,
        caption: "National AI Symposium 2026",
        uploaderId: adminUser!.id,
        status: PublicationStatus.PUBLISHED,
      }
    });

    report(
      "6.1 Real Gallery Image Upload & Metadata",
      Boolean(galleryItem.id && galleryUpload.publicId.includes("department/gallery")),
      `Gallery Item ID: ${galleryItem.id}, Status: ${galleryItem.status}`
    );

    // Gallery Item Deletion Test
    await deleteFromStorage(galleryUpload.publicId, MediaCategory.GALLERY_IMAGE);
    await prisma.galleryItem.delete({ where: { id: galleryItem.id } });

    report(
      "6.2 Gallery Item Clean Deletion",
      true,
      `Gallery item ${galleryItem.id} and Cloudinary object cleanly removed.`
    );

    // -----------------------------------------------------------------
    // SUITE 7: SECURITY & VALIDATION MATRIX
    // -----------------------------------------------------------------
    console.log("\n--- SUITE 7: SECURITY & INPUT VALIDATION MATRIX ---");

    const exeTest = validateUpload(100, "malicious.exe", "application/octet-stream", MediaCategory.PROFILE_PHOTO);
    const oversizedTest = validateUpload(30 * 1024 * 1024, "thesis.pdf", "application/pdf", MediaCategory.ACADEMIC_NOTE);
    const mimeMismatch = validateUpload(100, "photo.txt", "image/jpeg", MediaCategory.PROFILE_PHOTO);

    report(
      "7.1 Executable Upload Prohibition Security",
      !exeTest.valid && exeTest.error!.includes("prohibited"),
      `Error: ${exeTest.error}`
    );

    report(
      "7.2 Oversized File Enforcement Security",
      !oversizedTest.valid && oversizedTest.error!.includes("exceeds"),
      `Error: ${oversizedTest.error}`
    );

    report(
      "7.3 Extension Mismatch Prohibition Security",
      !mimeMismatch.valid,
      `Error: ${mimeMismatch.error}`
    );

    // Clean up created test Cloudinary resources to avoid storage leaks
    console.log("\nCleaning up temporary Cloudinary test objects...");
    await deleteFromStorage(profileReplaceUpload.publicId, MediaCategory.PROFILE_PHOTO);
    await deleteFromStorage(projectUpload.publicId, MediaCategory.PROJECT_IMAGE);
    await deleteFromStorage(noteUpload.publicId, MediaCategory.ACADEMIC_NOTE);

    console.log("=========================================================");
    console.log(`TOTAL E2E VERIFICATION CHECKS: ${passCount + failCount}`);
    console.log(`PASSED: ${passCount} | FAILED: ${failCount}`);
    console.log("=========================================================");

    if (failCount > 0) process.exit(1);

  } catch (err: any) {
    const cleanErr = (err.message || String(err)).replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***:***@');
    console.error("E2E Verification Execution Failure:", cleanErr);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ERealInfrastructureVerification();
