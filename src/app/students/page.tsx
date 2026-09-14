import { Metadata } from "next";
import Link from "next/link";
import { getPublicStudentProfiles, getStudentBatches } from "@/lib/services/faculty.service";
import { GraduationCap } from "lucide-react";
import StudentProfileCard from "@/components/StudentProfileCard";

export const metadata: Metadata = {
  title: "Student Showcase | St. Berchmans College AI & Data Science",
  description:
    "Explore the public student directory and batch showcase for the Department of Artificial Intelligence & Data Science.",
};

interface StudentsPageProps {
  searchParams: Promise<{ batch?: string }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const selectedBatch = params.batch || "ALL";

  // Fetch approved student profiles and available batches from DB
  const [students, availableBatches] = await Promise.all([
    getPublicStudentProfiles(selectedBatch).catch(() => []),
    getStudentBatches().catch(() => []),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          Student Community &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Student Showcase & Directory
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Public directory of approved student profiles and academic batches in the Department of Artificial Intelligence & Data Science.
        </p>
      </section>

      {/* BATCH FILTER BAR */}
      {availableBatches.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 border-b border-[#EFEAE3] pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#756860] mr-2">
            Filter Batch:
          </span>
          <Link
            href="/students"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedBatch === "ALL"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50"
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
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50"
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
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                No Public Student Profiles Yet
              </h2>
              <p className="text-sm text-[#756860]">
                Public student directory profiles will appear here as student registrations are approved by administration.
              </p>
            </div>
            <p className="text-xs text-[#756860] bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Registered students remain in PENDING status until verified and approved.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
