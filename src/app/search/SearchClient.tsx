"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchResults } from "@/lib/services/search.service";
import {
  Search,
  BookOpen,
  Users,
  GraduationCap,
  FolderKanban,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    courses: [],
    faculty: [],
    students: [],
    projects: [],
    events: [],
    notes: [],
  });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({
        courses: [],
        faculty: [],
        students: [],
        projects: [],
        events: [],
        notes: [],
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults =
    results.courses.length +
    results.faculty.length +
    results.students.length +
    results.projects.length +
    results.events.length +
    results.notes.length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* SEARCH INPUT BAR */}
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#756860]">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search department resources..."
          aria-label="Search department resources"
          className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white border border-[#EFEAE3] shadow-sm text-sm sm:text-base text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent transition-all placeholder:text-[#9A8F86]"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#756860]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      {query.trim() !== "" && (
        <div className="w-full max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 border-b border-[#EFEAE3] pb-4">
          {[
            { id: "ALL", label: `All (${totalResults})` },
            { id: "COURSES", label: `Courses (${results.courses.length})` },
            { id: "FACULTY", label: `Faculty (${results.faculty.length})` },
            { id: "STUDENTS", label: `Students (${results.students.length})` },
            { id: "PROJECTS", label: `Projects (${results.projects.length})` },
            { id: "EVENTS", label: `Events (${results.events.length})` },
            { id: "NOTES", label: `Notes (${results.notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* RESULTS DISPLAY */}
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {query.trim() === "" ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-3 max-w-xl mx-auto shadow-xs">
            <Search className="w-10 h-10 text-[#756860] mx-auto opacity-30" />
            <h2 className="text-lg font-bold font-heading text-[#1C1917]">
              Start typing to search
            </h2>
            <p className="text-xs sm:text-sm text-[#756860] leading-relaxed">
              Search across subject syllabus, faculty directory, approved student showcase, projects, events, and study notes.
            </p>
          </div>
        ) : totalResults === 0 && !loading ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-3 max-w-xl mx-auto shadow-xs">
            <h2 className="text-lg font-bold font-heading text-[#1C1917]">
              No results found for &ldquo;{query}&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-[#756860] leading-relaxed">
              Try searching with different keywords such as subject codes (AIDS101), course titles, faculty names, or event terms.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* COURSES */}
            {(activeFilter === "ALL" || activeFilter === "COURSES") && results.courses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1C1917]" /> Courses ({results.courses.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.courses.map((item) => (
                    <Link
                      key={item.id}
                      href={`/courses?semester=${item.semester}`}
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#1C1917]">{item.code}</span>
                        <span className="text-[10px] font-bold text-[#756860]">Sem {item.semester}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.name}</h4>
                      {item.description && <p className="text-xs text-[#756860] line-clamp-2">{item.description}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FACULTY */}
            {(activeFilter === "ALL" || activeFilter === "FACULTY") && results.faculty.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1C1917]" /> Faculty ({results.faculty.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.faculty.map((item) => (
                    <Link
                      key={item.id}
                      href="/faculty"
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.fullName}</h4>
                      <p className="text-xs font-semibold text-[#756860]">{item.designation}</p>
                      <p className="text-xs text-[#756860]">{item.qualification}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* STUDENTS */}
            {(activeFilter === "ALL" || activeFilter === "STUDENTS") && results.students.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1C1917]" /> Students ({results.students.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.students.map((item) => (
                    <Link
                      key={item.id}
                      href={`/students?batch=${encodeURIComponent(item.batch)}`}
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.fullName}</h4>
                      <p className="text-xs text-[#756860]">
                        Batch {item.batch} &bull; <span className="font-mono">{item.registerNumber}</span>
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {(activeFilter === "ALL" || activeFilter === "PROJECTS") && results.projects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#1C1917]" /> Projects ({results.projects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.projects.map((item) => (
                    <Link
                      key={item.id}
                      href="/projects"
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.title}</h4>
                      <p className="text-xs text-[#756860] line-clamp-2">{item.description}</p>
                      <p className="text-[11px] font-semibold text-[#1C1917] pt-1">
                        By {item.studentName} ({item.batch})
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* EVENTS */}
            {(activeFilter === "ALL" || activeFilter === "EVENTS") && results.events.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1C1917]" /> Events ({results.events.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.events.map((item) => (
                    <Link
                      key={item.id}
                      href="/events"
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <span className="text-[10px] font-bold text-[#FDB27C] bg-[#1C1917] px-2 py-0.5 rounded-md inline-block">
                        {new Date(item.eventDate).toLocaleDateString()}
                      </span>
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.title}</h4>
                      <p className="text-xs text-[#756860] line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES */}
            {(activeFilter === "ALL" || activeFilter === "NOTES") && results.notes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#756860] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1C1917]" /> Study Notes ({results.notes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {results.notes.map((item) => (
                    <Link
                      key={item.id}
                      href="/academics"
                      className="p-5 rounded-2xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] transition-all space-y-1 block shadow-xs min-w-0"
                    >
                      <span className="text-[10px] font-bold font-mono text-[#756860]">
                        {item.subjectCode} &bull; Sem {item.semester}
                      </span>
                      <h4 className="text-base font-bold text-[#1C1917] truncate">{item.title}</h4>
                      <p className="text-xs text-[#756860]">Uploaded by {item.uploaderName}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
