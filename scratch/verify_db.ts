import { PrismaClient } from '@prisma/client';

async function verifyDatabase() {
  console.log("=== NEON POSTGRESQL & PRISMA CONNECTIVITY TEST ===");

  const dbUrl = process.env.DATABASE_URL || '';
  const isLoaded = Boolean(dbUrl);
  const isNeonHost = dbUrl.includes('neon.tech') || dbUrl.includes('aws.neon.tech');
  
  console.log("DATABASE_URL loaded from .env:", isLoaded ? "YES" : "NO");
  console.log("Target host recognized as Neon PostgreSQL:", isNeonHost ? "YES" : "NO");

  if (!isLoaded) {
    console.error("ERROR: DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log("Connecting to PostgreSQL via Prisma Client...");
    await prisma.$connect();
    console.log("Prisma $connect(): SUCCESS");

    // Execute simple lightweight raw query to confirm active DB connection
    const result = await prisma.$queryRaw`SELECT 1 as connection_test;`;
    console.log("PostgreSQL Raw Query (SELECT 1): SUCCESS", Array.isArray(result) && result.length > 0);

    console.log("=== DATABASE VERIFICATION RESULT: PASSED ===");
  } catch (err: any) {
    // Sanitize any potential connection URI details from error message
    const sanitizedError = (err.message || String(err)).replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***:***@');
    console.error("Prisma Connection Failed:", sanitizedError);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
