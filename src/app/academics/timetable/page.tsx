import { Metadata } from "next";
import Link from "next/link";
import TimetableClient from "@/components/TimetableClient";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Class Timetable | St. Berchmans College AI & Data Science",
  description:
    "Official academic timetable and weekly class schedule for the Department of Artificial Intelligence & Data Science at St. Berchmans College.",
};

export default function TimetablePage() {
  return (
    <main className="w-[96%] max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Navigation Breadcrumb / Back Link */}
      <div>
        <Link
          href="/academics"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#756860] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Academics & Curriculum
        </Link>
      </div>

      {/* Embedded Timetable Component */}
      <TimetableClient />
    </main>
  );
}
