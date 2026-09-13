import { Metadata } from "next";
import SearchClient from "./SearchClient";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Department | St. Berchmans College AI & Data Science",
  description:
    "Search courses, subjects, faculty profiles, approved student directory, projects, events, and study notes.",
};

export default function SearchPage() {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 sm:space-y-10">
      {/* HERO HEADER */}
      <section className="space-y-3 sm:space-y-4 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Global Search &bull; St. Berchmans College
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Search Department Resources
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[#756860] leading-relaxed max-w-2xl mx-auto">
          Find subjects, course codes, faculty directory, approved student profiles, projects, events, and study materials.
        </p>
      </section>

      {/* SEARCH INTERFACE */}
      <SearchClient />
    </main>
  );
}
