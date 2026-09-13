import { Metadata } from "next";
import { MapPin, Mail, Clock, Building2 } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | St. Berchmans College AI & Data Science",
  description:
    "Contact information and inquiry portal for the Department of Artificial Intelligence & Data Science at St. Berchmans College.",
};

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          Department Contact &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Have questions regarding the BSc AI & Data Science program, admissions, academic collaborations, or department activities? Reach out to us.
        </p>
      </section>

      {/* CONTACT INFORMATION & FORM GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Verified Institutional Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1C1917] text-white p-8 sm:p-10 rounded-3xl border border-[#231F1C] space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FDB27C]">
                Official Address
              </span>
              <h2 className="text-2xl font-bold font-heading">
                St. Berchmans College
              </h2>
              <p className="text-sm font-semibold text-[#FDB27C]">
                Department of Artificial Intelligence & Data Science
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#756860] pt-4 border-t border-[#756860]/20">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FDB27C] shrink-0 mt-0.5" />
                <span className="text-white">
                  Changanassery, Kottayam District, <br />
                  Kerala, India — 686101
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FDB27C] shrink-0 mt-0.5" />
                <span className="text-white">aids.dept@sbcollege.ac.in</span>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[#FDB27C] shrink-0 mt-0.5" />
                <span className="text-white">Main Science Block, Campus</span>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FDB27C] shrink-0 mt-0.5" />
                <span className="text-white">Monday &ndash; Friday: 9:00 AM &ndash; 4:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Inquiry Form UI */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EFEAE3] shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-heading text-[#1C1917]">
                Send an Inquiry
              </h2>
              <p className="text-xs text-[#756860]">
                Submit your inquiry and department representatives will respond.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
