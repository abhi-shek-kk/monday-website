import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function applyMigrationStatements() {
  console.log("=== EXECUTING MIGRATION STATEMENTS INDIVIDUALLY ON NEON ===");
  const prisma = new PrismaClient();

  try {
    const sqlPath = path.join(process.cwd(), 'prisma', 'migrations', '20260913000000_init_con0_foundation', 'migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Strip comments first
    const noComments = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split SQL by semicolon
    const statements = noComments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Parsed ${statements.length} SQL statements...`);
    let executedCount = 0;

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
        executedCount++;
      } catch (err: any) {
        if (err.message?.includes("already exists")) {
          executedCount++;
        } else {
          console.warn(`Statement notice (${stmt.substring(0, 30)}...):`, err.message);
        }
      }
    }

    console.log(`Successfully processed ${executedCount} DDL statements.`);

    // Verify User table
    const userCount = await prisma.user.count();
    console.log("User table verified! Count:", userCount);
  } catch (err: any) {
    const cleanErr = (err.message || String(err)).replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***:***@');
    console.error("Migration Execution Failed:", cleanErr);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrationStatements();
