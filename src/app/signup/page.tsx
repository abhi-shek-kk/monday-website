"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Lock, Mail, GraduationCap, FileText, Calendar, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#FBF9F7] text-[#1C1917]">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-[#EFEAE3] shadow-sm my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FDB27C]/20 text-[#1C1917] mb-3">
            <GraduationCap className="w-6 h-6 text-[#1C1917]" />
          </div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
            Student Registration
          </h1>
          <p className="text-sm text-[#756860] mt-1">
            Department of Artificial Intelligence & Data Science
          </p>
        </div>

        {/* Notice about admin approval */}
        <div className="mb-6 p-4 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-xs text-[#756860] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#FDB27C] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#1C1917]">Approval Required:</strong> New student accounts are reviewed and verified by department administration before portal access is granted.
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Registration Received</h3>
            <p className="text-sm text-amber-800">{successMessage}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-amber-900 hover:bg-amber-950 text-white font-medium text-sm rounded-xl transition-all"
              >
                Return to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                  Register / Roll No *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="registerNumber"
                    required
                    value={formData.registerNumber}
                    onChange={handleChange}
                    placeholder="e.g. 2600123"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                  Batch *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                  >
                    <option value="2026-2030">2026 - 2030 (First Batch)</option>
                    <option value="2027-2031">2027 - 2031</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                Username * (Login Identifier)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Unique username (e.g. johndoe26)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                Optional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@sbcollege.ac.in (Optional)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756860]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB27C] text-[#1C1917]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-[#1C1917] hover:bg-[#231F1C] text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting Registration..." : "Submit Registration Request"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#EFEAE3] text-center text-sm text-[#756860]">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#1C1917] hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
