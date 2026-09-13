import { Metadata } from "next";
import { db } from "@/lib/db";
import { AccountStatus } from "@prisma/client";
import { FolderKanban, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Student Projects | St. Berchmans College AI & Data Science",
  description:
    "Showcase of public research, software, and AI projects developed by students of St. Berchmans College.",
};

export default async function ProjectsPage() {
  // Query public projects from DB
  const projects = await db.project.findMany({
    where: {
      student: {
        user: {
          status: AccountStatus.APPROVED,
        },
      },
    },
    include: {
      student: {
        select: {
          fullName: true,
          batch: true,
          registerNumber: true,
          profilePhotoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          Student Innovation &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Student Project Showcase
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Discover artificial intelligence applications, data science models, and software systems built by our department students.
        </p>
      </section>

      {/* PROJECTS GRID */}
      <section>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: { id: string; title: string; description: string; imageUrl: string | null; isFeatured: boolean; projectUrl: string | null; student: { fullName: string; batch: string } }) => (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-[#EFEAE3] shadow-xs p-8 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-44 rounded-2xl object-cover border border-[#EFEAE3]"
                    />
                  )}

                  <div className="space-y-2">
                    {project.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Featured Project
                      </span>
                    )}
                    <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                      {project.title}
                    </h2>
                    <p className="text-xs text-[#756860] leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFEAE3] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#756860] block">Developed By:</span>
                    <strong className="text-[#1C1917]">
                      {project.student.fullName} ({project.student.batch})
                    </strong>
                  </div>

                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#1C1917] text-white hover:bg-[#231F1C] transition-colors"
                      aria-label="View Project"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
              <FolderKanban className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                No Public Projects Published Yet
              </h2>
              <p className="text-sm text-[#756860]">
                Student projects will be showcased here as approved students build and publish their portfolios.
              </p>
            </div>
            <p className="text-xs text-[#756860] bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Project creation and portfolio publishing will be managed via the Student Portal.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
