-- Enable Row Level Security (RLS) on StudentProfile table
ALTER TABLE "StudentProfile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_authorized_student_profile_select" ON "StudentProfile";
DROP POLICY IF EXISTS "allow_authorized_student_profile_all" ON "StudentProfile";

-- Policy: Allow SELECT only for STUDENT, FACULTY, and ADMIN roles with APPROVED status
CREATE POLICY "allow_authorized_student_profile_select" ON "StudentProfile"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = "StudentProfile"."userId"
        AND u.role IN ('STUDENT', 'FACULTY', 'ADMIN')
        AND u.status = 'APPROVED'
    )
  );

-- Policy: Allow ALL operations for authenticated STUDENT, FACULTY, ADMIN
CREATE POLICY "allow_authorized_student_profile_all" ON "StudentProfile"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = "StudentProfile"."userId"
        AND u.role IN ('STUDENT', 'FACULTY', 'ADMIN')
    )
  );
