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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Global Search &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Search Department Resources
        </h1>
        <p className="text-base text-[#756860] leading-relaxed">
          Find subjects, course codes, faculty directory, approved student profiles, projects, events, and study materials.
        </p>
      </section>

      {/* SEARCH INTERFACE */}
      <SearchClient />
    </main>
  );
}
