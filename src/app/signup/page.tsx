"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Lock,
  Mail,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function StudentSignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    registerNumber: "",
    batch: "2026-2030",
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          registerNumber: formData.registerNumber,
          batch: formData.batch,
          email: formData.email || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data.message || "Your registration is pending admin approval.");
      setIsSubmitting(false);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FBF9F7] dark:bg-[#141210] text-[#1C1917] dark:text-white">
      {/* Unified Single Composition Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#1C1917] rounded-3xl sm:rounded-[2rem] border border-[#EFEAE3] dark:border-[#282420] shadow-lg sm:shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] sm:min-h-[640px]">
        {/* Left Column: Vertically Centered Registration Form (~50%) */}
        <div className="lg:col-span-6 flex flex-col justify-center p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#EFEAE3]/80 dark:border-[#282420] order-1">
          <div className="w-full space-y-4">
            {/* Header & Typography Hierarchy */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] shadow-2xs mb-0.5">
                <Image
                  src="/images/branding/sb-college-logo.jpg"
                  alt="St. Berchmans College Logo"
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain rounded-xl"
                />
              </div>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-[#756860] dark:text-[#A89F91]">
                STUDENT PORTAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-white font-heading">
                Student Registration
              </h1>
              <p className="text-xs text-[#756860] dark:text-[#A89F91]">
                Department of Artificial Intelligence & Data Science
              </p>
            </div>

            {/* Notice about admin approval */}
            <div className="p-3.5 rounded-xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] text-xs text-[#756860] dark:text-[#A89F91] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FDB27C] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-[#1C1917] dark:text-white">Approval Required:</strong> New student accounts are reviewed and verified by department administration before portal access is granted.
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage ? (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Registration Received</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">{successMessage}</p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-amber-900 dark:bg-[#FDB27C] hover:bg-amber-950 dark:hover:bg-[#fca562] text-white dark:text-[#1C1917] font-medium text-sm rounded-xl transition-all font-bold"
                  >
                    Return to Login <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                      Register / Roll No *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="registerNumber"
                        required
                        value={formData.registerNumber}
                        onChange={handleChange}
                        placeholder="e.g. 2600123"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                      Batch *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <select
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all"
                      >
                        <option value="2026-2030">2026 - 2030 (First Batch)</option>
                        <option value="2027-2031">2027 - 2031</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                    Username * (Login Identifier)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Unique username (e.g. johndoe26)"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                    Optional Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@sbcollege.ac.in (Optional)"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] dark:text-[#A89F91] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860] dark:text-[#A89F91]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 dark:focus:ring-[#FDB27C]/30 focus:border-[#1C1917] dark:focus:border-[#FDB27C] text-[#1C1917] dark:text-white transition-all placeholder:text-[#9A8F86] dark:placeholder:text-[#A89F91]/70"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-white transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-[#1C1917] dark:bg-[#FDB27C] hover:bg-[#231F1C] dark:hover:bg-[#fca562] active:scale-[0.99] text-white dark:text-[#1C1917] font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
                >
                  {isSubmitting ? "Submitting Registration..." : "Submit Registration Request"}
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#EFEAE3] dark:border-[#282420] text-center text-xs text-[#756860] dark:text-[#A89F91]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1C1917] dark:text-[#FDB27C] hover:underline underline-offset-4"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Tower Sketch Visual Panel (~50%) */}
        <div className="lg:col-span-6 bg-[#F6F3EE] dark:bg-[#231F1C] flex items-center justify-center p-3 sm:p-4 relative min-h-[360px] sm:min-h-[440px] lg:min-h-full order-2 overflow-hidden">
          <div className="relative w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[560px] flex items-center justify-center">
            <Image
              src="/images/login/sb-tower-sketch.png"
              alt="St. Berchmans College Architectural Sketch"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain scale-[1.10] sm:scale-[1.14] hover:scale-[1.16] transition-transform duration-700 drop-shadow-xs dark:invert-[0.9] dark:hue-rotate-180"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
