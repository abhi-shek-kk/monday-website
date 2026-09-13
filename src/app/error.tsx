"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely to server console without rendering stack traces to end-users
    console.error("Application runtime error:", error.message);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EFEAE3] p-8 shadow-sm text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold font-heading text-[#1C1917]">
            Something went wrong
          </h1>
          <p className="text-xs text-[#756860] leading-relaxed">
            The page encountered an unexpected issue while loading data. Please try again or return to the homepage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C1917] text-white text-xs font-semibold hover:bg-[#231F1C] transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FDB27C]" /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#EFEAE3] bg-white text-[#1C1917] text-xs font-semibold hover:bg-[#FBF9F7] transition-all"
          >
            <Home className="w-3.5 h-3.5 text-[#756860]" /> Home
          </Link>
        </div>
      </div>
    </main>
  );
}
