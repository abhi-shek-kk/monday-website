import { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Target,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Department Vision & Mission | St. Berchmans College AI & Data Science",
  description:
    "Explore the strategic vision, core mission, and educational values of the Department of Artificial Intelligence & Data Science at St. Berchmans College.",
};

export default function VisionPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] dark:bg-[#282420] text-[#1C1917] dark:text-white text-xs font-semibold">
          Department Vision & Mission &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] dark:text-white tracking-tight">
          Inspiring Innovation, Ethics & Academic Leadership
        </h1>
        <p className="text-lg text-[#756860] dark:text-[#A89F91] leading-relaxed">
          Guiding our students to excel in modern Artificial Intelligence, ethical computing, and data-driven problem solving to impact society positively.
        </p>
      </section>

      {/* VISION & MISSION CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* VISION */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1917] dark:bg-[#FDB27C] text-[#FDB27C] dark:text-[#1C1917] flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860] dark:text-[#A89F91] block">
              Strategic Vision
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
              Our Vision
            </h2>
            <p className="text-base text-[#756860] dark:text-[#A89F91] leading-relaxed">
              To become a recognized center of academic excellence and technical innovation in Artificial Intelligence and Data Science, fostering skilled professionals who transform industry and society with technical proficiency and human-centric values.
            </p>
          </div>
          <div className="pt-4 border-t border-[#EFEAE3] dark:border-[#282420] text-xs font-medium text-[#756860] dark:text-[#A89F91]">
            Excellence &bull; Integrity &bull; Technological Leadership
          </div>
        </div>

        {/* MISSION */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1917] dark:bg-[#FDB27C] text-[#FDB27C] dark:text-[#1C1917] flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860] dark:text-[#A89F91] block">
              Department Goals
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
              Our Mission
            </h2>
            <ul className="space-y-3 text-sm text-[#756860] dark:text-[#A89F91]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Deliver rigorous theoretical and practical instruction in computing, machine learning, and data analytics.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Cultivate critical thinking, algorithmic problem-solving, and continuous research capabilities among students.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Instill high ethical standards regarding data privacy, AI fairness, and positive societal impact.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-[#EFEAE3] dark:border-[#282420] text-xs font-medium text-[#756860] dark:text-[#A89F91]">
            Ethical Computing &bull; Global Standards &bull; Research Driven
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="space-y-8">
        <div className="border-b border-[#EFEAE3] dark:border-[#282420] pb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#756860] dark:text-[#A89F91]">
            Foundational Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
            Core Departmental Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAE3] dark:bg-[#282420] text-[#1C1917] dark:text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-white">Innovation & Discovery</h3>
            <p className="text-xs text-[#756860] dark:text-[#A89F91] leading-relaxed">
              Encouraging students to explore emerging AI paradigms, deep learning architectures, and generative modeling applications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAE3] dark:bg-[#282420] text-[#1C1917] dark:text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-white">Ethical Responsibility</h3>
            <p className="text-xs text-[#756860] dark:text-[#A89F91] leading-relaxed">
              Ensuring AI systems are developed transparently, with fairness, accountability, and respect for user privacy at heart.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#EFEAE3] dark:border-[#282420] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAE3] dark:bg-[#282420] text-[#1C1917] dark:text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-white">Academic Excellence</h3>
            <p className="text-xs text-[#756860] dark:text-[#A89F91] leading-relaxed">
              Combining strong theoretical foundations in linear algebra, statistics, and algorithm design with hands-on software labs.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#FBF9F7] dark:bg-[#1C1917] p-8 sm:p-12 rounded-3xl border border-[#EFEAE3] dark:border-[#282420] text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917] dark:text-white">
          Learn More About Our Program
        </h2>
        <p className="text-sm text-[#756860] dark:text-[#A89F91] max-w-xl mx-auto">
          Explore our curriculum structure, faculty directory, and student activities.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#1C1917] dark:bg-[#FDB27C] text-white dark:text-[#1C1917] text-sm font-bold hover:bg-[#231F1C] dark:hover:bg-[#fca562] transition-all shadow-sm"
          >
            About Department <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/academics"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-white dark:bg-[#282420] text-[#1C1917] dark:text-white border border-[#EFEAE3] dark:border-[#38322D] text-sm font-bold hover:bg-[#EFEAE3]/50 transition-all"
          >
            Academic Framework
          </Link>
        </div>
      </section>
    </main>
  );
}
