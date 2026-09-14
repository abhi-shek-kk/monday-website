import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import FacultyDashboardClient from "@/components/FacultyDashboardClient";
import { Award, CheckCircle2 } from "lucide-react";

export default async function FacultyDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "FACULTY" || session.status !== "APPROVED") {
    redirect("/login");
  }

  const { user } = session;
  const profile = user.facultyProfile;

  return (
    <div className="min-h-screen bg-[#FBF9F7] dark:bg-[#141210] text-[#1C1917] dark:text-[#FBF9F7]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1C1917] border-b border-[#EFEAE3] dark:border-[#38322D] sticky top-0 z-10">
        <div className="w-[96%] max-w-none mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDB27C]/20 flex items-center justify-center text-[#1C1917] dark:text-[#FDB27C]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#756860] dark:text-[#A89F91] uppercase tracking-wider block leading-none">
                Faculty Portal
              </span>
              <span className="text-sm font-bold text-[#1C1917] dark:text-[#FBF9F7]">
                St. Berchmans College &mdash; AI &amp; DS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-[#FBF9F7] dark:bg-[#141210] px-3 py-1.5 rounded-full border border-[#EFEAE3] dark:border-[#38322D]">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-semibold text-[#1C1917] dark:text-[#FBF9F7]">{session.username}</span>
              <span className="text-[#756860] dark:text-[#A89F91]">({session.role})</span>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[96%] max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-[#1C1917] p-6 sm:p-8 rounded-2xl border border-[#EFEAE3] dark:border-[#38322D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/50 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Provisioned Faculty Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#FBF9F7]">
              Welcome, {profile?.fullName || session.username}!
            </h1>
            <p className="text-sm text-[#756860] dark:text-[#A89F91] mt-1">
              {profile?.designation ? `${profile.designation} — Department of AI & DS` : "Faculty Member"}
            </p>
          </div>
        </div>

        {/* Faculty Dashboard Client Component */}
        <FacultyDashboardClient />
      </main>
    </div>
  );
}
