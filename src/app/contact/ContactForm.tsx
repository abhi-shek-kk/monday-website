"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200 font-heading">
          Inquiry Submitted Successfully
        </h3>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
          Thank you for reaching out to the Department of Artificial Intelligence & Data Science. Our administrative team will review your inquiry.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 px-4 py-2 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-bold text-[#1C1917] dark:text-[#FBF9F7]">Your Name</label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] text-sm text-[#1C1917] dark:text-white placeholder-[#756860]/70 dark:placeholder-[#A89F91]/70 focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#FDB27C]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-bold text-[#1C1917] dark:text-[#FBF9F7]">Email Address</label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] text-sm text-[#1C1917] dark:text-white placeholder-[#756860]/70 dark:placeholder-[#A89F91]/70 focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#FDB27C]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-xs font-bold text-[#1C1917] dark:text-[#FBF9F7]">Subject / Topic</label>
        <input
          id="contact-subject"
          type="text"
          required
          placeholder="e.g. Admission Inquiry, Academic Syllabus"
          className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] text-sm text-[#1C1917] dark:text-white placeholder-[#756860]/70 dark:placeholder-[#A89F91]/70 focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#FDB27C]"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-bold text-[#1C1917] dark:text-[#FBF9F7]">Message</label>
        <textarea
          id="contact-message"
          rows={4}
          required
          placeholder="Write your detailed message..."
          className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] dark:bg-[#231F1C] border border-[#EFEAE3] dark:border-[#38322D] text-sm text-[#1C1917] dark:text-white placeholder-[#756860]/70 dark:placeholder-[#A89F91]/70 focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#FDB27C]"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#1C1917] dark:bg-[#FDB27C] text-white dark:text-[#1C1917] font-medium text-sm hover:bg-[#231F1C] dark:hover:bg-[#fca562] transition-all shadow-sm"
      >
        <Send className="w-4 h-4 text-[#FDB27C] dark:text-[#1C1917]" /> Submit Inquiry
      </button>
    </form>
  );
}
