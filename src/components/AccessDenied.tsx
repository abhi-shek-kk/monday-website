"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  userRole?: string;
}

export default function AccessDenied({
  title = "Access Denied",
  message = "You do not have the required permissions to view student profile data. Access is strictly limited to Student, Faculty, and Admin roles.",
  userRole,
}: AccessDeniedProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[70vh] flex items-center justify-center">
      <div className="w-full bg-white dark:bg-[#1C1917] rounded-3xl border border-[#EFEAE3] dark:border-[#38322D] p-8 sm:p-12 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Top accent banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Restricted Resource
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7] tracking-tight">
            {title}
          </h1>
          <p className="text-base text-[#756860] dark:text-[#A89F91] leading-relaxed">
            {message}
          </p>
          {userRole && (
            <p className="text-xs font-mono text-[#756860] dark:text-[#A89F91] bg-[#FBF9F7] dark:bg-[#141210] py-1.5 px-3 rounded-lg border border-[#EFEAE3] dark:border-[#38322D] inline-block">
              Current Role: <span className="font-bold text-[#1C1917] dark:text-[#FBF9F7]">{userRole}</span>
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] text-white dark:bg-[#FBF9F7] dark:text-[#141210] text-sm font-semibold hover:bg-[#231F1C] dark:hover:bg-[#EFEAE3] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#EFEAE3] dark:border-[#38322D] bg-white dark:bg-[#28231D] text-[#1C1917] dark:text-[#FBF9F7] text-sm font-semibold hover:bg-[#FBF9F7] dark:hover:bg-[#38322D] transition-all shadow-xs"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </main>
  );
}
