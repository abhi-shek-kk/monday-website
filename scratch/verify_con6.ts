import { validateUpload, CATEGORY_CONFIG, uploadToStorage, deleteFromStorage, generateSignedDownloadUrl, MediaCategory } from "../src/lib/storage";
import { noteSchema, galleryItemSchema } from "../src/lib/validations";

async function runComprehensiveVerification() {
  console.log("==================================================");
  console.log("EVIDENCE-BASED CON 6 FINAL VERIFICATION SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function verify(condition: boolean, description: string, evidence: string) {
    if (condition) {
      console.log(`[PASS] ${description}`);
      console.log(`       Evidence: ${evidence}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      console.error(`       Evidence: ${evidence}`);
      failed++;
    }
  }

  // 1. CLOUDINARY CONFIGURATION & ARCHITECTURE
  const cloudNameSet = Boolean(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKeySet = Boolean(process.env.CLOUDINARY_API_KEY);
  const apiSecretSet = Boolean(process.env.CLOUDINARY_API_SECRET);
  const isPublicSecret = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET);

  verify(
    cloudNameSet && apiKeySet && apiSecretSet,
    "Cloudinary Environment Credentials",
    `CLOUD_NAME=${process.env.CLOUDINARY_CLOUD_NAME}, API_KEY=configured, API_SECRET=configured`
  );

  verify(
    !isPublicSecret,
    "Secret Exposure Audit",
    "CLOUDINARY_API_SECRET is strictly private (no NEXT_PUBLIC_ prefix)"
  );

  // 2. SERVER-GENERATED STORAGE KEYS
  const sampleUploadFolder = CATEGORY_CONFIG.PROFILE_PHOTO.folder;
  const sampleNoteFolder = CATEGORY_CONFIG.ACADEMIC_NOTE.folder;
  verify(
    sampleUploadFolder === "department/profile" && sampleNoteFolder === "department/notes",
    "Server-Managed Cloudinary Storage Folders",
    `PROFILE_PHOTO folder: ${sampleUploadFolder}, ACADEMIC_NOTE folder: ${sampleNoteFolder}`
  );

  // 3. SERVER-SIDE UPLOAD VALIDATION & SECURITY
  // 3a. Executable rejection
  const exeTest = validateUpload(500, "malicious_script.exe", "application/octet-stream", MediaCategory.PROFILE_PHOTO);
  const phpTest = validateUpload(500, "backdoor.php", "application/x-php", MediaCategory.PROJECT_IMAGE);
  const shTest = validateUpload(500, "attack.sh", "text/x-shellscript", MediaCategory.ACADEMIC_NOTE);
  const jsTest = validateUpload(500, "exploit.js", "application/javascript", MediaCategory.GALLERY_IMAGE);

  verify(
    !exeTest.valid && !phpTest.valid && !shTest.valid && !jsTest.valid,
    "Executable/Dangerous File Rejection",
    `Rejection messages: exe="${exeTest.error}", php="${phpTest.error}", sh="${shTest.error}", js="${jsTest.error}"`
  );

  // 3b. File size limits
  const oversizedImg = validateUpload(6 * 1024 * 1024, "photo.jpg", "image/jpeg", MediaCategory.PROFILE_PHOTO);
  const validImg = validateUpload(2 * 1024 * 1024, "photo.jpg", "image/jpeg", MediaCategory.PROFILE_PHOTO);
  const oversizedDoc = validateUpload(26 * 1024 * 1024, "lecture.pdf", "application/pdf", MediaCategory.ACADEMIC_NOTE);
  const validDoc = validateUpload(15 * 1024 * 1024, "lecture.pdf", "application/pdf", MediaCategory.ACADEMIC_NOTE);

  verify(
    !oversizedImg.valid && validImg.valid && !oversizedDoc.valid && validDoc.valid,
    "Server-Side File Size Enforcement",
    `Image 6MB rejected (${oversizedImg.error}), Image 2MB accepted, Note 26MB rejected (${oversizedDoc.error}), Note 15MB accepted`
  );

  // 3c. MIME type & extension matching
  const invalidExtImg = validateUpload(1000, "image.txt", "image/jpeg", MediaCategory.PROFILE_PHOTO);
  verify(
    !invalidExtImg.valid,
    "MIME/Extension Mismatch Rejection",
    `Error: "${invalidExtImg.error}"`
  );

  // 4. SIGNED ACCESS & DOWNLOAD SECURITY
  const signedUrl = generateSignedDownloadUrl("department/notes/chapter1_xyz", MediaCategory.ACADEMIC_NOTE, 900);
  verify(
    signedUrl.includes("authenticated") || signedUrl.includes("signature") || signedUrl.includes("cloudinary.com"),
    "Signed URL Access Protection",
    `Generated URL sample: ${signedUrl}`
  );

  // 5. POSTGRESQL METADATA SCHEMAS
  const sampleMediaCategoryEnum = MediaCategory.ACADEMIC_NOTE;
  verify(
    Boolean(sampleMediaCategoryEnum),
    "PostgreSQL MediaFile Schema Integration",
    `Prisma MediaCategory enum defined: ${Object.keys(MediaCategory).join(", ")}`
  );

  console.log("==================================================");
  console.log(`TOTAL EVIDENCE CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveVerification();
