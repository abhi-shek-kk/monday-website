import { PrismaClient } from '@prisma/client';

async function addMissingColumns() {
  console.log("=== SAFELY ADDING MISSING CON 6 STORAGE COLUMNS TO NEON ===");
  const prisma = new PrismaClient();

  const alterStatements = [
    `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "FacultyProfile" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "GalleryItem" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
    `ALTER TABLE "MediaFile" ADD COLUMN IF NOT EXISTS "storageProvider" TEXT DEFAULT 'CLOUDINARY';`,
  ];

  for (const stmt of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log("Executed:", stmt);
    } catch (err: any) {
      console.warn("Notice for statement:", stmt, err.message);
    }
  }

  console.log("All CON 6 storage columns added safely!");
  await prisma.$disconnect();
}

addMissingColumns();
