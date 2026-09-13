import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Course Catalog | St. Berchmans College AI & Data Science",
  description:
    "Comprehensive course catalog for the BSc Artificial Intelligence & Data Science program at St. Berchmans College.",
};

interface CoursesPageProps {
  searchParams: Promise<{ semester?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const selectedSemester = params.semester ? parseInt(params.semester, 10) : null;

  // Query subjects from database with assigned faculty relations
  const subjects = await db.subject.findMany({
    where: selectedSemester ? { semester: selectedSemester } : {},
    include: {
      faculties: {
        include: {
          faculty: {
            select: {
              fullName: true,
              designation: true,
            },
          },
        },
      },
      notes: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ semester: "asc" }, { code: "asc" }],
  });

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Academic Catalog &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          BSc AI & Data Science Courses
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Detailed subject syllabus structure, course codes, credit assignments, and assigned faculty for the 4-year degree program.
        </p>
      </section>

      {/* SEMESTER FILTER BAR */}
      <section className="flex flex-wrap items-center gap-2 border-b border-[#EFEAE3] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#756860] mr-2">
          Filter Semester:
        </span>
        <Link
          href="/courses"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            !selectedSemester
              ? "bg-[#1C1917] text-white shadow-xs"
              : "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50"
          }`}
        >
          All Semesters
        </Link>
        {semesters.map((sem) => (
          <Link
            key={sem}
            href={`/courses?semester=${sem}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSemester === sem
                ? "bg-[#1C1917] text-white shadow-xs"
                : "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50"
            }`}
          >
            Sem {sem}
          </Link>
        ))}
      </section>

      {/* COURSES GRID */}
      <section className="space-y-6">
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject: { id: string; code: string; name: string; semester: number; description: string | null; faculties: Array<{ faculty: { fullName: string; designation: string } }>; notes: Array<{ id: string }> }) => (
              <div
                key={subject.id}
                className="p-8 rounded-3xl bg-white border border-[#EFEAE3] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-3 py-1 rounded-lg bg-[#1C1917] text-[#FDB27C]">
                      {subject.code}
                    </span>
                    <span className="text-xs font-bold text-[#756860] bg-[#FBF9F7] px-3 py-1 rounded-lg border border-[#EFEAE3]">
                      Semester {subject.semester}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                    {subject.name}
                  </h2>

                  {subject.description ? (
                    <p className="text-sm text-[#756860] leading-relaxed">
                      {subject.description}
                    </p>
                  ) : (
                    <p className="text-xs italic text-[#756860]">
                      Course syllabus details will be updated.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EFEAE3] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#756860] font-semibold">Faculty In-Charge:</span>
                    {subject.faculties.length > 0 ? (
                      <span className="font-bold text-[#1C1917]">
                        {subject.faculties.map((f: { faculty: { fullName: string } }) => f.faculty.fullName).join(", ")}
                      </span>
                    ) : (
                      <span className="text-[#756860] italic">To be assigned</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#756860] font-semibold">Available Notes:</span>
                    <span className="font-bold text-[#1C1917]">
                      {subject.notes.length} {subject.notes.length === 1 ? "File" : "Files"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#756860] mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-[#1C1917]">
              No courses found for Semester {selectedSemester}
            </h3>
            <p className="text-xs text-[#756860]">
              Please select a different semester filter or browse all semesters.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-block px-4 py-2 rounded-xl bg-[#1C1917] text-white text-xs font-semibold"
              >
                Clear Filter
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
