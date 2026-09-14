"use client";

import React from "react";
import { Award, BookOpen } from "lucide-react";

interface FacultyProfileCardProps {
  userItem: {
    id: string;
    facultyProfile?: {
      id?: string;
      fullName: string;
      designation: string;
      qualification: string;
      bio?: string | null;
      profilePhotoUrl?: string | null;
      subjects?: Array<{
        id: string;
        subject: {
          code: string;
          name: string;
        };
      }>;
    } | null;
  };
}

export default function FacultyProfileCard({ userItem }: FacultyProfileCardProps) {
  const profile = userItem.facultyProfile;
  if (!profile) return null;

  return (
    <div className="group relative w-full rounded-[2rem] overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between aspect-[3/4] min-h-[440px]">
      {/* Background Image Container / Portrait Base */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-amber-50 via-stone-200 to-stone-900/70 overflow-hidden">
        {profile.profilePhotoUrl ? (
          <img
            src={profile.profilePhotoUrl}
            alt={profile.fullName}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1917] via-[#2D2622] to-[#1C1917] text-[#FDB27C] p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-3xl font-serif font-bold shadow-inner text-white">
              {profile.fullName.charAt(0)}
            </div>
            <Award className="w-6 h-6 text-amber-300/60" />
          </div>
        )}
        {/* Darkening overlay for text readability on lower glass panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-500 group-hover:opacity-95" />
      </div>

      {/* Top Header Floating Badges */}
      <div className="relative z-10 p-5 flex items-center justify-between w-full">
        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-amber-200 text-[11px] font-mono font-semibold tracking-wide shadow-sm flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-300" />
          Faculty Mentor
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/40 text-blue-200 text-[10px] font-semibold tracking-wider uppercase">
          Academic Staff
        </span>
      </div>

      {/* Glassmorphism Information Panel (Lower Portion) */}
      <div className="relative z-10 m-3 sm:m-4 p-5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-lg transition-all duration-500 group-hover:bg-white/25 group-hover:border-white/50 group-hover:shadow-2xl text-white space-y-3">
        <div>
          <h3 className="text-xl font-bold font-heading text-white tracking-tight leading-snug drop-shadow-sm">
            {profile.fullName}
          </h3>
          <p className="text-xs font-medium text-amber-200/90 mt-0.5">
            {profile.designation}
          </p>
          <p className="text-[11px] text-white/75 font-mono">
            {profile.qualification}
          </p>
        </div>

        {profile.bio && (
          <p className="text-xs text-white/85 leading-relaxed line-clamp-2 pt-2 border-t border-white/15 font-light">
            {profile.bio}
          </p>
        )}

        {/* Assigned Subjects Tags */}
        {profile.subjects && profile.subjects.length > 0 && (
          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-white/70" />
              Courses
            </span>
            <div className="flex flex-wrap gap-1">
              {profile.subjects.map((subItem) => (
                <span
                  key={subItem.id}
                  className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-medium"
                >
                  {subItem.subject.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
