import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { MediaCategory } from "@prisma/client";

// Ensure Cloudinary is configured from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo_cloud";
const apiKey = process.env.CLOUDINARY_API_KEY || "1234567890";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "demo_secret";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { MediaCategory };

export interface UploadOptions {
  originalName: string;
  mimeType: string;
  category: MediaCategory;
  uploaderId: string;
}

export interface UploadResult {
  publicId: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: MediaCategory;
}

// Category Configuration Limits & Folders
export const CATEGORY_CONFIG: Record<
  MediaCategory,
  {
    folder: string;
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    resourceType: "image" | "raw";
  }
> = {
  PROFILE_PHOTO: {
    folder: "department/profile",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    resourceType: "image",
  },
  PROJECT_IMAGE: {
    folder: "department/projects",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    resourceType: "image",
  },
  FACULTY_PHOTO: {
    folder: "department/faculty",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    resourceType: "image",
  },
  GALLERY_IMAGE: {
    folder: "department/gallery",
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    resourceType: "image",
  },
  ACADEMIC_NOTE: {
    folder: "department/notes",
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"],
    resourceType: "raw",
  },
};

// Strict list of prohibited executable extensions
const FORBIDDEN_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".php",
  ".dll",
  ".scr",
  ".vbs",
  ".msi",
  ".jar",
  ".com",
  ".py",
  ".c",
  ".cpp",
  ".h",
  ".ps1",
  ".bash",
  ".zsh",
  ".htpasswd",
  ".htaccess",
]);

/**
 * Server-side validation of uploaded file properties.
 */
export function validateUpload(
  fileSize: number,
  originalName: string,
  mimeType: string,
  category: MediaCategory
): { valid: boolean; error?: string } {
  const config = CATEGORY_CONFIG[category];
  if (!config) {
    return { valid: false, error: "Invalid storage category." };
  }

  // Check file size
  if (fileSize > config.maxSizeBytes) {
    const maxMb = Math.round(config.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${maxMb}MB for ${category.replace("_", " ").toLowerCase()}.`,
    };
  }

  // Extract file extension cleanly
  const extIndex = originalName.lastIndexOf(".");
  if (extIndex === -1) {
    return { valid: false, error: "File must have a valid extension." };
  }
  const ext = originalName.substring(extIndex).toLowerCase();

  // Explicit check for executable or unsafe extensions
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Security violation: File extension '${ext}' is explicitly prohibited.`,
    };
  }

  // Check allowed extensions for category
  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension '${ext}'. Allowed extensions for ${category.replace("_", " ").toLowerCase()}: ${config.allowedExtensions.join(", ")}`,
    };
  }

  // Check MIME type if provided and not generic
  if (mimeType && config.resourceType !== "raw") {
    const normalizedMime = mimeType.toLowerCase();
    if (!config.allowedMimeTypes.includes(normalizedMime)) {
      return {
        valid: false,
        error: `Unsupported file type '${mimeType}'. Required type for ${category.replace("_", " ").toLowerCase()}: ${config.allowedMimeTypes.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Centralized upload operation using Cloudinary API stream.
 */
export async function uploadToStorage(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
  const { originalName, mimeType, category } = options;
  const size = buffer.length;

  // Server-side validation
  const validation = validateUpload(size, originalName, mimeType, category);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed.");
  }

  const config = CATEGORY_CONFIG[category];
  const safeBaseName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.[^/.]+$/, "");
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const publicId = `${config.folder}/${safeBaseName}_${randomSuffix}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: config.resourceType,
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          // If Cloudinary credentials are mock or connection fails, return mock durable result in dev mode
          if (process.env.NODE_ENV !== "production" && (cloudName === "demo_cloud" || error?.message?.includes("Invalid API key"))) {
            const devUrl = `https://res.cloudinary.com/${cloudName}/${config.resourceType}/upload/v1/${publicId}`;
            return resolve({
              publicId,
              url: devUrl,
              originalName,
              mimeType,
              size,
              category,
            });
          }
          return reject(
            new Error(
              `Storage Provider Error: ${error?.message || "Failed to upload object to cloud storage."}`
            )
          );
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          originalName,
          mimeType,
          size: result.bytes || size,
          category,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Remove an object from Cloudinary storage.
 */
export async function deleteFromStorage(publicId: string, category: MediaCategory): Promise<boolean> {
  if (!publicId) return true;
  try {
    const config = CATEGORY_CONFIG[category];
    const resourceType = config ? config.resourceType : "image";

    if (cloudName === "demo_cloud" && process.env.NODE_ENV !== "production") {
      return true;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Storage deletion error:", error);
    return false;
  }
}

/**
 * Generate secure signed URL for protected files (e.g. academic notes).
 */
export function generateSignedDownloadUrl(publicId: string, category: MediaCategory = "ACADEMIC_NOTE", expiresInSeconds: number = 900): string {
  const config = CATEGORY_CONFIG[category];
  const resourceType = config ? config.resourceType : "raw";
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  try {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      expires_at: expiresAt,
      secure: true,
    });
  } catch {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });
  }
}
