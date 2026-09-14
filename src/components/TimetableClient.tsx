"use client";

import React, { useState } from "react";
import { TIMETABLE_DATA, TimetableCell } from "@/lib/timetableData";
import { Calendar, Clock, Info, ShieldCheck } from "lucide-react";

export default function TimetableClient() {
  const [selectedSemester, setSelectedSemester] = useState<string>("S1");
  const [hoveredCell, setHoveredCell] = useState<{
    cell: TimetableCell;
    day: string;
  } | null>(null);

  const activeTimetable = TIMETABLE_DATA[selectedSemester];
  const periods = [1, 2, 3, 4, 5, 6];

  // Helper for category badges
  const getCategoryStyles = (category: TimetableCell["category"]) => {
    switch (category) {
      case "DSC":
        return {
          bg: "bg-[#1C1917] text-white border-[#332D29]",
          badge: "bg-amber-400/20 text-amber-200 border-amber-400/30",
          label: "Core Theory",
        };
      case "LAB":
        return {
          bg: "bg-emerald-950/80 text-emerald-100 border-emerald-800/50 backdrop-blur-md",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          label: "Practical Lab",
        };
      case "MDC":
        return {
          bg: "bg-indigo-950/80 text-indigo-100 border-indigo-800/50 backdrop-blur-md",
          badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
          label: "Multi-Disciplinary",
        };
      case "LANG":
        return {
          bg: "bg-amber-950/80 text-amber-100 border-amber-800/50 backdrop-blur-md",
          badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
          label: "Language",
        };
      case "ENG":
        return {
          bg: "bg-sky-950/80 text-sky-100 border-sky-800/50 backdrop-blur-md",
          badge: "bg-sky-500/20 text-sky-300 border-sky-400/30",
          label: "English",
        };
      case "MENTOR":
        return {
          bg: "bg-purple-950/80 text-purple-100 border-purple-800/50 backdrop-blur-md",
          badge: "bg-purple-500/20 text-purple-300 border-purple-400/30",
          label: "Mentoring & Value",
        };
      default:
        return {
          bg: "bg-stone-900 text-white border-stone-800",
          badge: "bg-stone-700 text-stone-300 border-stone-600",
          label: "Academic",
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          Academic Schedule &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Class Timetable
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Official academic schedule and weekly lecture matrix for the Department of Artificial Intelligence & Data Science.
        </p>
      </div>

      {/* SEMESTER TAB CONTROLS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EFEAE3] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#756860] mr-2">
          Select Semester:
        </span>
        {Object.keys(TIMETABLE_DATA).map((sem) => {
          const isCurrent = selectedSemester === sem;
          const isAvail = TIMETABLE_DATA[sem].isAvailable;

          return (
            <button
              key={sem}
              onClick={() => isAvail && setSelectedSemester(sem)}
              disabled={!isAvail}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCurrent
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : isAvail
                  ? "bg-white text-[#756860] border border-[#EFEAE3] hover:bg-[#EFEAE3]/50 cursor-pointer"
                  : "bg-[#FBF9F7] text-[#756860]/50 border border-[#EFEAE3]/60 cursor-not-allowed"
              }`}
            >
              <span>{sem}</span>
              {!isAvail && (
                <span className="px-1.5 py-0.5 rounded bg-[#EFEAE3] text-[9px] font-mono text-[#756860] uppercase">
                  Coming Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN TIMETABLE CONTAINER CARD */}
      <div className="bg-[#FBF9F7] rounded-3xl border border-[#EFEAE3] shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Card Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEAE3] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#756860] block">
              Schedule Matrix
            </span>
            <h2 className="text-2xl font-bold font-heading text-[#1C1917]">
              {activeTimetable.title}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#EFEAE3] text-xs font-bold text-[#1C1917] self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Order Days (Day 1 – Day 5)
          </div>
        </div>

        {/* RESPONSIVE HORIZONTALLY SCROLLABLE TABLE */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-stone-300">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-[#FBF9F7] p-3 text-left text-xs font-bold font-heading uppercase tracking-wider text-[#1C1917] border-b-2 border-[#EFEAE3] w-28">
                  DAY
                </th>
                {periods.map((p) => (
                  <th
                    key={p}
                    className="p-3 text-center text-xs font-bold font-mono uppercase tracking-wider text-[#1C1917] border-b-2 border-[#EFEAE3] min-w-[130px]"
                  >
                    PERIOD {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAE3]">
              {activeTimetable.schedule.map((daySchedule) => (
                <tr key={daySchedule.day} className="group/row hover:bg-white/40 transition-colors">
                  {/* Sticky Day Column */}
                  <td className="sticky left-0 z-10 bg-[#FBF9F7] group-hover/row:bg-[#F8F5F1] p-3 text-sm font-bold font-heading text-[#1C1917] border-r border-[#EFEAE3]">
                    <div className="flex flex-col">
                      <span>{daySchedule.day}</span>
                      <span className="text-[10px] font-mono text-[#756860] font-normal">
                        {daySchedule.label}
                      </span>
                    </div>
                  </td>

                  {/* Render Period Cells with Spanning Support */}
                  {daySchedule.cells.map((cell) => {
                    const styles = getCategoryStyles(cell.category);
                    const colSpan = cell.span || 1;

                    return (
                      <td
                        key={`${daySchedule.day}-${cell.period}`}
                        colSpan={colSpan}
                        onMouseEnter={() => setHoveredCell({ cell, day: daySchedule.day })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="p-2 align-top"
                      >
                        <div
                          className={`h-full min-h-[96px] p-3 rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between cursor-pointer ${styles.bg}`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-mono text-[10px] font-bold tracking-wider uppercase opacity-85">
                              {cell.code}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${styles.badge}`}
                            >
                              {cell.category}
                            </span>
                          </div>

                          <p className="text-xs font-semibold leading-snug line-clamp-2 my-1">
                            {cell.name}
                          </p>

                          <div className="flex items-center justify-between text-[10px] opacity-75 font-mono pt-1 border-t border-white/10">
                            <span>
                              P{cell.period}
                              {cell.span && cell.span > 1 ? `–P${cell.period + cell.span - 1}` : ""}
                            </span>
                            {cell.span && cell.span > 1 && (
                              <span className="font-sans text-[9px] uppercase tracking-tight">
                                Practical Span
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INTERACTIVE HOVER TOOLTIP / DETAILS FOOTER */}
        {hoveredCell ? (
          <div className="p-4 rounded-2xl bg-[#1C1917] text-white border border-[#332D29] shadow-lg flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300">{hoveredCell.cell.code}</span>
                <span className="text-stone-400">&bull;</span>
                <span className="font-bold">{hoveredCell.cell.name}</span>
              </div>
              <p className="text-[#756860] text-[11px]">
                {hoveredCell.day} &bull; Period {hoveredCell.cell.period}
                {hoveredCell.cell.span && hoveredCell.cell.span > 1
                  ? ` to Period ${hoveredCell.cell.period + hoveredCell.cell.span - 1}`
                  : ""}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-[10px] font-mono font-semibold uppercase">
              {getCategoryStyles(hoveredCell.cell.category).label}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-white border border-[#EFEAE3] text-[#756860] text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1C1917] shrink-0" />
            <span>Hover or tap on any timetable cell to inspect course details and period spans.</span>
          </div>
        )}

        {/* RESTRAINED CATEGORY LEGEND */}
        <div className="pt-4 border-t border-[#EFEAE3] flex flex-wrap items-center gap-4 text-xs text-[#756860]">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[#1C1917]">
            Subject Categories:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
            <span>Core Theory (DSC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Practical Labs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Multi-Disciplinary (MDC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Language</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>English</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Mentoring / Skill</span>
          </div>
        </div>
      </div>
    </div>
  );
}
