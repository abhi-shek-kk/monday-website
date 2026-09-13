import { Metadata } from "next";
import { getPublicFacultyProfiles } from "@/lib/services/faculty.service";
import { Users, Sparkles } from "lucide-react";

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Department Directory &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Faculty Directory
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Our distinguished educators, researchers, and academic mentors driving Artificial Intelligence & Data Science instruction at St. Berchmans College.
        </p>
      </section>

      {/* FACULTY LIST GRID */}
      <section>
        {facultyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyList.map((userItem: any) => {
              const profile = userItem.facultyProfile;
              if (!profile) return null;

              return (
                <div
                  key={userItem.id}
                  className="bg-white rounded-3xl border border-[#EFEAE3] shadow-xs p-8 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {profile.profilePhotoUrl ? (
                        <img
                          src={profile.profilePhotoUrl}
                          alt={profile.fullName}
                          className="w-16 h-16 rounded-2xl object-cover border border-[#EFEAE3]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center font-serif text-2xl font-bold shrink-0">
                          {profile.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                          {profile.fullName}
                        </h2>
                        <p className="text-xs font-semibold text-[#756860]">{profile.designation}</p>
                        <p className="text-xs text-[#756860]">{profile.qualification}</p>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-xs text-[#756860] leading-relaxed border-t border-[#EFEAE3] pt-4">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {profile.subjects && profile.subjects.length > 0 && (
                    <div className="pt-4 border-t border-[#EFEAE3] space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#756860] block">
                        Assigned Subjects:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.subjects.map((subItem: any) => (
                          <span
                            key={subItem.id}
                            className="px-2.5 py-1 rounded-lg bg-[#FBF9F7] border border-[#EFEAE3] text-xs font-mono font-semibold text-[#1C1917]"
                          >
                            {subItem.subject.code} — {subItem.subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                Faculty Directory Updating
              </h2>
              <p className="text-sm text-[#756860]">
                Faculty profiles will be available here as the department directory is updated.
              </p>
            </div>
            <p className="text-xs text-[#756860] bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Faculty accounts at St. Berchmans College are provisioned directly by administration.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
