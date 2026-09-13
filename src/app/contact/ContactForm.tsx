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
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-bold text-emerald-900 font-heading">
          Inquiry Submitted Successfully
        </h3>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto">
          Thank you for reaching out to the Department of Artificial Intelligence & Data Science. Our administrative team will review your inquiry.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
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
          <label htmlFor="contact-name" className="text-xs font-bold text-[#1C1917]">Your Name</label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-bold text-[#1C1917]">Email Address</label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-xs font-bold text-[#1C1917]">Subject / Topic</label>
        <input
          id="contact-subject"
          type="text"
          required
          placeholder="e.g. Admission Inquiry, Academic Syllabus"
          className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-bold text-[#1C1917]">Message</label>
        <textarea
          id="contact-message"
          rows={4}
          required
          placeholder="Write your detailed message..."
          className="w-full px-4 py-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#1C1917] text-white font-medium text-sm hover:bg-[#231F1C] transition-all shadow-sm"
      >
        <Send className="w-4 h-4 text-[#FDB27C]" /> Submit Inquiry
      </button>
    </form>
  );
}
