import { Metadata } from "next";
import { getPublicFacultyProfiles } from "@/lib/services/faculty.service";
import { Users } from "lucide-react";
import FacultyProfileCard from "@/components/FacultyProfileCard";

export const metadata: Metadata = {
  title: "Faculty Directory | St. Berchmans College AI & Data Science",
  description:
    "Meet the faculty members of the Department of Artificial Intelligence & Data Science at St. Berchmans College.",
};

export default async function FacultyPage() {
  const facultyList = await getPublicFacultyProfiles().catch(() => []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] dark:bg-[#28231D] text-[#1C1917] dark:text-[#E6DFD5] text-xs font-semibold">
          Department Directory &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7] tracking-tight">
          Faculty Directory
        </h1>
        <p className="text-lg text-[#756860] dark:text-[#A89F91] leading-relaxed">
          Our distinguished educators, researchers, and academic mentors driving Artificial Intelligence & Data Science instruction at St. Berchmans College.
        </p>
      </section>

      {/* FACULTY LIST GRID */}
      <section>
        {facultyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyList.map((userItem: any) => (
              <FacultyProfileCard key={userItem.id} userItem={userItem} />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#38322D] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] dark:bg-[#141210] border border-[#EFEAE3] dark:border-[#38322D] text-[#756860] dark:text-[#A89F91] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7]">
                Faculty Directory Updating
              </h2>
              <p className="text-sm text-[#756860] dark:text-[#A89F91]">
                Faculty profiles will be available here as the department directory is updated.
              </p>
            </div>
            <p className="text-xs text-[#756860] dark:text-[#A89F91] bg-[#FBF9F7] dark:bg-[#141210] p-3 rounded-xl border border-[#EFEAE3] dark:border-[#38322D]">
              Faculty accounts at St. Berchmans College are provisioned directly by administration.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
