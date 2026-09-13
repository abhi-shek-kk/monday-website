import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

async function main() {
  console.log("=== PROJECT ENVIRONMENT INSPECTION ===");
  console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL));
  console.log("CLOUDINARY_CLOUD_NAME set:", Boolean(process.env.CLOUDINARY_CLOUD_NAME));
  console.log("CLOUDINARY_API_KEY set:", Boolean(process.env.CLOUDINARY_API_KEY));
  console.log("CLOUDINARY_API_SECRET set:", Boolean(process.env.CLOUDINARY_API_SECRET));

  // Check 1: Prisma connection
  const prisma = new PrismaClient();
  let dbReachable = false;
  try {
    await prisma.$connect();
    dbReachable = true;
    console.log("[DB] Prisma connected successfully!");
  } catch (err: any) {
    const cleanMsg = (err.message || String(err)).replace(/postgresql:\/\/[^@]+@/, 'postgresql://***:***@');
    console.log("[DB] Prisma connection failed:", cleanMsg);
  } finally {
    await prisma.$disconnect();
  }

  // Check 2: Cloudinary real API call
  let cloudinaryReachable = false;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    try {
      const res = await cloudinary.api.ping();
      console.log("[CLOUDINARY] API ping success:", res.status);
      cloudinaryReachable = true;
    } catch (err: any) {
      console.log("[CLOUDINARY] API ping failed:", err.message);
    }
  }

  console.log("=== RESULT SUMMARY ===");
  console.log(`DB Reachable: ${dbReachable}`);
  console.log(`Cloudinary Reachable: ${cloudinaryReachable}`);
}

main();
