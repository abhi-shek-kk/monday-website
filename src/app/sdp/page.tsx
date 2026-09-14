import { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Code,
  Users,
  Award,
  Terminal,
  Laptop,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Student Development Program (SDP) | St. Berchmans College AI & Data Science",
  description:
    "Student Development Program (SDP) at St. Berchmans College AI & Data Science Department — enhancing technical skills, industry readiness, and research capabilities.",
};

export default function SDPPage() {
  return (
    <main className="w-[96%] max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] dark:bg-[#282420] text-[#1C1917] dark:text-white text-xs font-semibold">
          Skill Enhancement &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] dark:text-white tracking-tight">
          Student Development Program (SDP)
        </h1>
        <p className="text-lg text-[#756860] dark:text-[#A89F91] leading-relaxed">
          Empowering AI & Data Science students through hands-on technical workshops, industry mentorship, competitive programming, and soft skill workshops.
        </p>
      </section>

      {/* OVERVIEW & HIGHLIGHTS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1917] dark:bg-[#FDB27C] text-[#FDB27C] dark:text-[#1C1917] flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860] dark:text-[#A89F91] block">
              Program Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
              Bridging Academics and Industry Readiness
            </h2>
            <p className="text-sm sm:text-base text-[#756860] dark:text-[#A89F91] leading-relaxed">
              The Student Development Program (SDP) is a structured co-curricular initiative designed to complement classroom learning with real-world technical skills, hackathons, cloud certifications, and career development sessions.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-[#756860] dark:text-[#A89F91]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Specialized Tech Bootcamps:</strong> Python for Data Science, PyTorch/TensorFlow, and Full-Stack AI integration.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#756860] dark:text-[#A89F91]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Industry Interactions:</strong> Guest lectures and workshops conducted by AI researchers and data engineers.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#756860] dark:text-[#A89F91]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Research & Portfolio Mentorship:</strong> Guidance on publishing technical papers and building open-source portfolios.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#1C1917] text-white space-y-6 flex flex-col justify-between border border-[#231F1C]">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FDB27C]">
              Key Focus Areas
            </span>
            <h3 className="text-2xl font-bold font-heading">
              SDP Modules
            </h3>
            <ul className="space-y-4 text-xs text-[#A89F91]">
              <li className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-white block">1. Machine Learning & Deep Learning</span>
                <span>Practical model training, dataset curation, and hyperparameter tuning.</span>
              </li>
              <li className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-white block">2. Data Engineering & Cloud</span>
                <span>SQL/NoSQL pipelines, Docker containers, and cloud deployment basics.</span>
              </li>
              <li className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-white block">3. Soft Skills & Interview Prep</span>
                <span>Technical resume building, mock interviews, and presentation skills.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#FBF9F7] dark:bg-[#1C1917] p-8 sm:p-12 rounded-3xl border border-[#EFEAE3] dark:border-[#282420] text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
          Explore Student Projects & Events
        </h2>
        <p className="text-sm text-[#756860] dark:text-[#A89F91] max-w-xl mx-auto">
          See how our students apply their SDP training in hackathons, research projects, and department events.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#1C1917] dark:bg-[#FDB27C] text-white dark:text-[#1C1917] text-sm font-bold hover:bg-[#231F1C] dark:hover:bg-[#fca562] transition-all shadow-sm"
          >
            View Department Events <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-white dark:bg-[#282420] text-[#1C1917] dark:text-white border border-[#EFEAE3] dark:border-[#38322D] text-sm font-bold hover:bg-[#EFEAE3]/50 transition-all"
          >
            Student Projects Showcase
          </Link>
        </div>
      </section>
    </main>
  );
}
