"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, AlertCircle, ArrowRight, Clock, Eye, EyeOff, Info } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialError = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotNotice(null);
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

  const handleForgotPassword = () => {
    setForgotNotice(
      "To reset your account password, please contact the Department Administration or IT Office."
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Typography Hierarchy */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] shadow-2xs shrink-0">
            <Image
              src="/images/branding/sb-college-logo.jpg"
              alt="St. Berchmans College Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain rounded-lg"
            />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-widest text-[#756860]">
              STUDENT PORTAL
            </span>
            <span className="text-xs text-[#756860]">
              St. Berchmans College • Dept of AI & Data Science
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] font-heading">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#756860] mt-1">
            Sign in to access your department portal.
          </p>
        </div>
      </div>

      {/* Auth Error Banner */}
      {error && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
            isPendingNotice
              ? "bg-amber-50/90 border-amber-200 text-amber-900"
              : "bg-red-50/90 border-red-200 text-red-900"
          }`}
        >
          {isPendingNotice ? (
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {isPendingNotice ? "Registration Pending" : "Authentication Notice"}
            </p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Forgot Password Notice Banner */}
      {forgotNotice && (
        <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-[#1C1917] text-xs sm:text-sm flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#756860] shrink-0 mt-0.5" />
          <div className="leading-relaxed">{forgotNotice}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
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
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 focus:border-[#1C1917] text-[#1C1917] transition-all placeholder:text-[#9A8F86]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 focus:border-[#1C1917] text-[#1C1917] transition-all placeholder:text-[#9A8F86]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#756860] hover:text-[#1C1917] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-[#756860] hover:text-[#1C1917] hover:underline transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-[#1C1917] hover:bg-[#231F1C] active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Registration Footer Link */}
      <div className="pt-4 border-t border-[#EFEAE3] text-center text-xs text-[#756860]">
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FBF9F7] text-[#1C1917]">
      {/* Unified Single Composition Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl sm:rounded-[2rem] border border-[#EFEAE3] shadow-lg sm:shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px] sm:min-h-[580px]">
        {/* Left Column: Vertically Centered Login Form (~50%) */}
        <div className="lg:col-span-6 flex flex-col justify-center p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#EFEAE3]/80 order-1">
          <Suspense fallback={<div className="text-sm text-[#756860] text-center py-8">Loading sign in form...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Right Column: Architectural Tower Sketch Visual Panel (~50%) */}
        <div className="lg:col-span-6 bg-[#F6F3EE] flex items-center justify-center p-3 sm:p-4 relative min-h-[320px] sm:min-h-[420px] lg:min-h-full order-2 overflow-hidden">
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[480px] flex items-center justify-center">
            <Image
              src="/images/login/sb-tower-sketch.png"
              alt="St. Berchmans College Architectural Sketch"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain scale-[1.10] sm:scale-[1.14] hover:scale-[1.16] transition-transform duration-700 drop-shadow-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
