import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPublicStudentProfiles, getStudentBatches } from "@/lib/services/faculty.service";
import { GraduationCap } from "lucide-react";
import StudentProfileCard from "@/components/StudentProfileCard";
import AccessDenied from "@/components/AccessDenied";
import { Role, AccountStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Student Directory | St. Berchmans College AI & Data Science",
  description:
    "Directory of student profiles and academic batches in the Department of Artificial Intelligence & Data Science.",
};

interface StudentsPageProps {
  searchParams: Promise<{ batch?: string }>;
}

const ALLOWED_ROLES: string[] = [Role.STUDENT, Role.FACULTY, Role.ADMIN];

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const session = await getSession();

  // 1. Frontend Access Check: Logged out users are redirected to Login page
  if (!session) {
    redirect("/login?callbackUrl=/students");
  }

  // 2. Frontend Access Check: Role verification (Allowed: STUDENT, FACULTY, ADMIN)
  const isAllowedRole = session.role && ALLOWED_ROLES.includes(session.role);
  const isApprovedAccount = session.status === AccountStatus.APPROVED;

  if (!isAllowedRole || !isApprovedAccount) {
    return (
      <AccessDenied
        title="Student Profiles Access Restricted"
        message="Student profiles can only be accessed by authenticated users with student, faculty, or admin roles."
        userRole={session.role}
      />
    );
  }

  const params = await searchParams;
  const selectedBatch = params.batch || "ALL";

  // 3. Backend Data Fetching with role parameter for backend verification
  const [students, availableBatches] = await Promise.all([
    getPublicStudentProfiles(selectedBatch, session.role).catch(() => []),
    getStudentBatches(session.role).catch(() => []),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] dark:bg-[#28231D] text-[#1C1917] dark:text-[#E6DFD5] text-xs font-semibold">
          Student Community &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7] tracking-tight">
          Student Showcase & Directory
        </h1>
        <p className="text-lg text-[#756860] dark:text-[#A89F91] leading-relaxed">
          Directory of student profiles and academic batches in the Department of Artificial Intelligence & Data Science.
        </p>
      </section>

      {/* BATCH FILTER BAR */}
      {availableBatches.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 border-b border-[#EFEAE3] dark:border-[#38322D] pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mr-2">
            Filter Batch:
          </span>
          <Link
            href="/students"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedBatch === "ALL"
                ? "bg-[#1C1917] text-white dark:bg-[#FBF9F7] dark:text-[#141210] shadow-xs"
                : "bg-white text-[#756860] dark:bg-[#1C1917] dark:text-[#A89F91] border border-[#EFEAE3] dark:border-[#38322D] hover:bg-[#EFEAE3]/50 dark:hover:bg-[#28231D]"
            }`}
          >
            All Batches
          </Link>
          {availableBatches.map((batch: string) => (
            <Link
              key={batch}
              href={`/students?batch=${encodeURIComponent(batch)}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBatch === batch
                  ? "bg-[#1C1917] text-white dark:bg-[#FBF9F7] dark:text-[#141210] shadow-xs"
                  : "bg-white text-[#756860] dark:bg-[#1C1917] dark:text-[#A89F91] border border-[#EFEAE3] dark:border-[#38322D] hover:bg-[#EFEAE3]/50 dark:hover:bg-[#28231D]"
              }`}
            >
              Batch {batch}
            </Link>
          ))}
        </section>
      )}

      {/* STUDENT CARDS GRID */}
      <section>
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map((userItem: any) => (
              <StudentProfileCard key={userItem.id} userItem={userItem} />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#38322D] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] dark:bg-[#141210] border border-[#EFEAE3] dark:border-[#38322D] text-[#756860] dark:text-[#A89F91] flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7]">
                No Student Profiles Found
              </h2>
              <p className="text-sm text-[#756860] dark:text-[#A89F91]">
                Approved student directory profiles will appear here.
              </p>
            </div>
            <p className="text-xs text-[#756860] dark:text-[#A89F91] bg-[#FBF9F7] dark:bg-[#141210] p-3 rounded-xl border border-[#EFEAE3] dark:border-[#38322D]">
              Registered students remain in PENDING status until verified and approved by administration.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
