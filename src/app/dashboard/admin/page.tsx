import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import AdminManagementClient from "@/components/AdminManagementClient";
import { ShieldCheck, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN" || session.status !== "APPROVED") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#1C1917]">
      {/* Header */}
      <header className="bg-white border-b border-[#EFEAE3] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDB27C]/20 flex items-center justify-center text-[#1C1917]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#756860] uppercase tracking-wider block leading-none">
                Admin Control Portal
              </span>
              <span className="text-sm font-bold text-[#1C1917]">
                St. Berchmans College — AI & DS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-[#FBF9F7] px-3 py-1.5 rounded-full border border-[#EFEAE3]">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-semibold text-[#1C1917]">{session.username}</span>
              <span className="text-[#756860]">({session.role})</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EFEAE3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 mb-3">
              <UserCheck className="w-3.5 h-3.5" /> Department Administrator Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
              Admin Control Center ({session.username})
            </h1>
            <p className="text-sm text-[#756860] mt-1">
              Comprehensive management portal for students, faculty, subjects, moderation, events, gallery, and academic content.
            </p>
          </div>
        </div>

        {/* Management Tools Client Component */}
        <AdminManagementClient />
      </main>
    </div>
  );
}
