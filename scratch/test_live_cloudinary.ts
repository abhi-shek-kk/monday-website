import { uploadToStorage, deleteFromStorage, MediaCategory } from "../src/lib/storage";

async function testLiveCloudinary() {
  console.log("=== LIVE CLOUDINARY E2E UPLOAD & DELETE TEST ===");
  // 1x1 pixel PNG binary buffer
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const testBuffer = Buffer.from(pngBase64, "base64");
  
  try {
    // 1. Live Upload
    console.log("Uploading valid PNG image to Cloudinary...");
    const uploadResult = await uploadToStorage(testBuffer, {
      originalName: "verification_test.png",
      mimeType: "image/png",
      category: MediaCategory.PROFILE_PHOTO,
      uploaderId: "test-user-id"
    });

    console.log("Upload Success!");
    console.log("Public ID:", uploadResult.publicId);
    console.log("URL:", uploadResult.url);
    console.log("Size:", uploadResult.size);

    // 2. Live Deletion
    console.log("Deleting test file from Cloudinary...");
    const deleted = await deleteFromStorage(uploadResult.publicId, MediaCategory.PROFILE_PHOTO);
    console.log("Deletion Status:", deleted ? "SUCCESSFULLY DELETED" : "FAILED DELETION");

    if (uploadResult.publicId && deleted) {
      console.log("=== LIVE CLOUDINARY TEST: PASSED ===");
    } else {
      console.log("=== LIVE CLOUDINARY TEST: FAILED ===");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Live Cloudinary Error:", err.message);
    process.exit(1);
  }
}

testLiveCloudinary();
