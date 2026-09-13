import { Metadata } from "next";
import Link from "next/link";
import { getPublicSubjects, PublicSubject } from "@/lib/services/subject.service";
import { getNotes } from "@/lib/services/note.service";
import { getSession } from "@/lib/auth";
import {
  BookOpen,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Academics & Notes | St. Berchmans College AI & Data Science",
  description:
    "Explore the BSc AI & Data Science academic framework, semester subjects, and study note repository.",
};

export default async function AcademicsPage() {
  const session = await getSession().catch(() => null);

  // Safe fetch for subjects and notes from Prisma DB / Fallback catalog
  const [subjects, notes] = await Promise.all([
    getPublicSubjects(),
    getNotes().catch(() => []),
  ]);

  // Group subjects by semester
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          Academic Framework &bull; BSc AI & Data Science
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Curriculum & Study Resources
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Explore the 8-semester curriculum for the BSc Artificial Intelligence & Data Science degree at St. Berchmans College, including course codes, semester subjects, and official faculty study notes.
        </p>
      </section>

      {/* DEGREE OVERVIEW CARD */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EFEAE3] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEAE3] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#756860]">
              Degree Program
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              BSc Artificial Intelligence & Data Science
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-xs font-bold text-[#1C1917]">
            <Layers className="w-4 h-4 text-[#FDB27C]" />
            8 Semesters (4 Years)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#756860]">
          <div className="space-y-1">
            <strong className="text-[#1C1917] block font-semibold">Foundational Years (S1 - S4)</strong>
            <p>Mathematics, Programming Basics, Data Structures, Algorithms, SQL Database Management, and Analytics.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#1C1917] block font-semibold">Advanced Specialization (S5 - S6)</strong>
            <p>Machine Learning, Deep Learning, Neural Networks, Advanced Statistics, and Data Mining techniques.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#1C1917] block font-semibold">Applied Excellence (S7 - S8)</strong>
            <p>Natural Language Processing, Computer Vision, AI Ethics, Capstone Research, and Project Deployment.</p>
          </div>
        </div>
      </section>

      {/* SEMESTER SUBJECT MATRIX */}
      <section className="space-y-6">
        <div className="border-b border-[#EFEAE3] pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
              Structure Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              Semester Courses & Subjects
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#756860] inline-flex items-center gap-1 transition-colors"
          >
            Full Course Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem) => {
            const semSubjects = subjects.filter((s: PublicSubject) => s.semester === sem);
            return (
              <div key={sem} className="p-6 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#EFEAE3] pb-2">
                    <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      Semester {sem}
                    </span>
                    <span className="text-xs font-medium text-[#756860]">
                      {semSubjects.length} {semSubjects.length === 1 ? "Subject" : "Subjects"}
                    </span>
                  </div>

                  {semSubjects.length > 0 ? (
                    <ul className="space-y-2 pt-1">
                      {semSubjects.map((sub: PublicSubject) => (
                        <li key={sub.id} className="text-xs space-y-0.5">
                          <span className="font-mono font-bold text-[#1C1917]">{sub.code}:</span>{" "}
                          <span className="text-[#756860] font-medium">{sub.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-[#756860] py-2">
                      Subjects for Semester {sem} will be updated.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href={`/courses?semester=${sem}`}
                    className="text-xs font-bold text-[#1C1917] hover:underline inline-flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACADEMIC STUDY NOTES REPOSITORY */}
      <section className="space-y-6">
        <div className="border-b border-[#EFEAE3] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
              Study Material Repository
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              Academic Notes & Resources
            </h2>
          </div>
          {!session && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              <Lock className="w-3.5 h-3.5" /> Note downloads require authenticated student/faculty account.
            </div>
          )}
        </div>

        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note: any) => (
              <div key={note.id} className="p-6 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] flex items-center justify-center text-[#1C1917]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1C1917] text-[#FDB27C] text-xs font-bold font-mono">
                    Sem {note.semester}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#756860]">
                    {note.subject?.code} &bull; {note.subject?.name}
                  </span>
                  <h3 className="text-base font-bold text-[#1C1917]">{note.title}</h3>
                  {note.description && (
                    <p className="text-xs text-[#756860] line-clamp-2">{note.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EFEAE3] flex items-center justify-between text-xs">
                  <span className="text-[#756860]">
                    Uploaded by <strong className="text-[#1C1917]">{note.uploader?.fullName || "Faculty"}</strong>
                  </span>

                  {session ? (
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1917] text-white font-medium hover:bg-[#231F1C] transition-all"
                    >
                      <Download className="w-3 h-3 text-[#FDB27C]" /> Download
                    </a>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FBF9F7] text-[#1C1917] border border-[#EFEAE3] font-medium hover:bg-[#EFEAE3]"
                    >
                      <Lock className="w-3 h-3 text-[#756860]" /> Login to Access
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-white border border-[#EFEAE3] text-center space-y-3">
            <FileText className="w-10 h-10 text-[#756860] mx-auto opacity-40" />
            <p className="text-base font-medium text-[#1C1917]">
              No study notes have been uploaded to the public directory yet.
            </p>
            <p className="text-xs text-[#756860] max-w-md mx-auto">
              Faculty members upload official lecture slides, lab manuals, and course references directly through their authenticated dashboard.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
