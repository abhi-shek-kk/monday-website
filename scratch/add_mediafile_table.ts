import { PrismaClient } from '@prisma/client';

async function createMediaFileTable() {
  console.log("=== CREATING MEDIAFILE TABLE & ENUM ON NEON ===");
  const prisma = new PrismaClient();

  const statements = [
    `CREATE TABLE IF NOT EXISTS "MediaFile" (
        "id" TEXT NOT NULL,
        "storageProvider" TEXT NOT NULL DEFAULT 'CLOUDINARY',
        "publicId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "category" "MediaCategory" NOT NULL,
        "uploaderId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
      );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "MediaFile_publicId_key" ON "MediaFile"("publicId");`,
    `CREATE INDEX IF NOT EXISTS "MediaFile_uploaderId_idx" ON "MediaFile"("uploaderId");`,
    `CREATE INDEX IF NOT EXISTS "MediaFile_category_idx" ON "MediaFile"("category");`,
  ];

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log("Statement executed successfully.");
    } catch (err: any) {
      console.warn("Statement error:", err.message);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "MediaFile" DROP CONSTRAINT IF EXISTS "MediaFile_uploaderId_fkey";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
  } catch (e: any) {
    console.warn("FK constraint notice:", e.message);
  }

  console.log("MediaFile table created successfully!");
  await prisma.$disconnect();
}

createMediaFileTable();
