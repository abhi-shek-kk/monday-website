"use client";

import React from "react";
import { GraduationCap, Github, Linkedin, Globe } from "lucide-react";

interface StudentProfileCardProps {
  userItem: {
    id: string;
    studentProfile?: {
      id?: string;
      fullName: string;
      registerNumber: string;
      batch?: string;
      bloodGroup?: string | null;
      dateOfBirth?: string | Date | null;
      bio?: string | null;
      profilePhotoUrl?: string | null;
      githubUrl?: string | null;
      linkedinUrl?: string | null;
      websiteUrl?: string | null;
      wingMemberships?: Array<{
        id: string;
        wing: { name: string };
      }>;
    } | null;
  };
}

export default function StudentProfileCard({ userItem }: StudentProfileCardProps) {
  const profile = userItem.studentProfile;
  if (!profile) return null;

  return (
    <div className="group relative w-full rounded-[2rem] overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between aspect-[3/4] min-h-[440px]">
      {/* Background Image Container / Portrait Base */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-stone-100 via-stone-200 to-stone-900/70 overflow-hidden">
        {profile.profilePhotoUrl ? (
          <img
            src={profile.profilePhotoUrl}
            alt={profile.fullName}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1917] via-[#2A2421] to-[#1C1917] text-[#FDB27C] p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-3xl font-serif font-bold shadow-inner text-white">
              {profile.fullName.charAt(0)}
            </div>
            <GraduationCap className="w-6 h-6 text-amber-300/60" />
          </div>
        )}
        {/* Subtle Overlay gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-500 group-hover:opacity-95" />
      </div>

      {/* Top Header Floating Badges */}
      <div className="relative z-10 p-5 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          {profile.batch ? (
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-mono font-medium tracking-wide shadow-sm">
              Batch {profile.batch}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-mono font-medium tracking-wide shadow-sm">
              AI & DS
            </span>
          )}
          {profile.bloodGroup && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/30 backdrop-blur-md border border-rose-400/40 text-rose-200 text-[10px] font-mono font-bold tracking-wide shadow-sm">
              {profile.bloodGroup}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[10px] font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Verified
        </span>
      </div>

      {/* Glassmorphism Information Panel (Lower Portion) */}
      <div className="relative z-10 m-3 sm:m-4 p-5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-lg transition-all duration-500 group-hover:bg-white/25 group-hover:border-white/50 group-hover:shadow-2xl text-white space-y-3">
        <div>
          <h3 className="text-xl font-bold font-heading text-white tracking-tight leading-snug drop-shadow-sm">
            {profile.fullName}
          </h3>
          <div className="flex items-center justify-between text-xs font-mono text-white/75 mt-0.5 tracking-wider">
            <span>REG: {profile.registerNumber}</span>
            {profile.dateOfBirth && (
              <span className="text-[11px] opacity-80">
                DOB: {new Date(profile.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-xs text-white/85 leading-relaxed line-clamp-2 pt-1 border-t border-white/15 font-light">
            {profile.bio}
          </p>
        )}

        {/* Wings & Social Links */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
          {profile.wingMemberships && profile.wingMemberships.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {profile.wingMemberships.map((m) => (
                <span
                  key={m.id}
                  className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold tracking-tight border border-white/20"
                >
                  {m.wing.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-white/50 italic font-light">
              Dept. Scholar
            </span>
          )}

          <div className="flex items-center gap-2 text-white/80">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-all transform hover:scale-110 p-1 rounded-md hover:bg-white/20"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-all transform hover:scale-110 p-1 rounded-md hover:bg-white/20"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-all transform hover:scale-110 p-1 rounded-md hover:bg-white/20"
                aria-label="Personal Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
