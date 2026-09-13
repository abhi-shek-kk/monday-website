"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, User, Lock, AlertCircle, ArrowRight, Clock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialError = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError || null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPendingNotice(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        if (data.isPending) {
          setIsPendingNotice(true);
        }
        setIsSubmitting(false);
        return;
      }

      const targetPath = callbackUrl || data.redirectUrl || "/dashboard/student";
      router.push(targetPath);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#EFEAE3] shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FDB27C]/20 text-[#1C1917] mb-3">
          <ShieldCheck className="w-6 h-6 text-[#1C1917]" />
        </div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
          St. Berchmans College
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
          Department Portal Sign In
        </h1>
        <p className="text-sm text-[#756860] mt-1">
          Department of Artificial Intelligence & Data Science
        </p>
      </div>

      {error && (
        <div
          className={`p-4 rounded-xl border mb-6 flex items-start gap-3 text-sm ${
            isPendingNotice
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {isPendingNotice ? (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {isPendingNotice ? "Registration Pending" : "Authentication Notice"}
            </p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] focus:border-transparent text-[#1C1917]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] focus:border-transparent text-[#1C1917]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-[#1C1917] hover:bg-[#231F1C] text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#EFEAE3] text-center text-sm text-[#756860]">
        Are you a student without an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#1C1917] hover:underline underline-offset-4"
        >
          Register for Student Portal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#FBF9F7] text-[#1C1917]">
      <Suspense fallback={<div className="text-sm text-[#756860]">Loading sign in form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
