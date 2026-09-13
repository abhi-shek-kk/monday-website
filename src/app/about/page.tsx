import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  BrainCircuit,
  Database,
  ShieldCheck,
  Award,
  Users,
  Compass,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Department | St. Berchmans College AI & Data Science",
  description:
    "Learn about the Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery, Kerala.",
};

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          About Department &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Pioneering AI & Data Science Education at SB College
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          The Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery, was founded to address the growing global demand for rigorous computing expertise, intelligent systems design, and ethical data science.
        </p>
      </section>

      {/* INSTITUTIONAL CONTEXT & HERITAGE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#EFEAE3] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3]">
              <Image
                src="/images/home/sb-college-centre.jpg"
                alt="St. Berchmans College campus"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-[#1C1917]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                Main Campus View
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
                Institutional Heritage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
                St. Berchmans College, Changanassery
              </h2>
              <p className="text-sm sm:text-base text-[#756860] leading-relaxed">
                St. Berchmans College is a premier higher education institution situated in Changanassery, Kottayam District, Kerala. Renowned for academic excellence, moral integrity, and community service, the college continuously expands its academic frontiers to incorporate cutting-edge technologies.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#1C1917] border-t border-[#EFEAE3]">
            <MapPin className="w-4 h-4 text-[#FDB27C]" />
            Changanassery, Kottayam District, Kerala, India
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-[#1C1917] text-white p-8 rounded-3xl border border-[#231F1C] space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FDB27C]">
                Department Identity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading">
                BSc AI & Data Science
              </h2>
              <p className="text-sm text-[#756860] leading-relaxed">
                Our degree program offers comprehensive training across foundational mathematics, algorithms, machine learning models, statistical inference, and responsible AI governance.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-[#756860] font-semibold uppercase tracking-wider block">
                Inaugural Cohort
              </span>
              <span className="text-sm font-bold text-[#FDB27C]">First Batch: 2026–2030</span>
            </div>
          </div>

          <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3] shadow-xs">
            <Image
              src="/images/home/sb-college-left.jpg"
              alt="View of St. Berchmans College campus"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-[#1C1917]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
              Campus Environment
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-[#EFEAE3] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-[#1C1917]">Department Vision</h3>
          <p className="text-sm text-[#756860] leading-relaxed">
            To become a premier center of academic excellence and technical innovation in Artificial Intelligence and Data Science, fostering skilled professionals who transform industry and society with technical proficiency and human-centric values.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#EFEAE3] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-[#1C1917]">Department Mission</h3>
          <ul className="space-y-2.5 text-sm text-[#756860]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Deliver rigorous theoretical and practical instruction in computing, machine learning, and data analytics.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Cultivate critical thinking, algorithmic problem-solving, and research capabilities among students.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Instill high ethical standards regarding data privacy, AI fairness, and societal impact.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CO-CURRICULAR WINGS */}
      <section className="space-y-6">
        <div className="border-b border-[#EFEAE3] pb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
            Holistic Student Development
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
            Co-Curricular Organizations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#EFEAE3] space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-[#FDB27C]/20 text-[#1C1917] text-xs font-bold inline-block">
              NSS WING
            </span>
            <h3 className="text-lg font-bold text-[#1C1917]">National Service Scheme</h3>
            <p className="text-xs text-[#756860] leading-relaxed">
              Fostering social responsibility through community literacy programs, environmental initiatives, and civic engagement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFEAE3] space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-[#EFEAE3] text-[#1C1917] text-xs font-bold inline-block">
              TECH TEAM
            </span>
            <h3 className="text-lg font-bold text-[#1C1917]">Department Tech Team</h3>
            <p className="text-xs text-[#756860] leading-relaxed">
              Driving software development, coding workshops, open-source projects, and inter-collegiate hackathons.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFEAE3] space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-[#FDB27C]/20 text-[#1C1917] text-xs font-bold inline-block">
              SPORTS WING
            </span>
            <h3 className="text-lg font-bold text-[#1C1917]">Sports & Athletics</h3>
            <p className="text-xs text-[#756860] leading-relaxed">
              Encouraging physical fitness, healthy competition, sportsmanship, and inter-department athletic tournaments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFEAE3] space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-[#EFEAE3] text-[#1C1917] text-xs font-bold inline-block">
              NCC WING
            </span>
            <h3 className="text-lg font-bold text-[#1C1917]">National Cadet Corps</h3>
            <p className="text-xs text-[#756860] leading-relaxed">
              Instilling leadership, discipline, national pride, and disaster management skills among department cadets.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#FBF9F7] p-8 sm:p-12 rounded-3xl border border-[#EFEAE3] text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
          Explore Academic Framework
        </h2>
        <p className="text-sm text-[#756860] max-w-xl mx-auto">
          Discover our 8-semester course structure, subject codes, and academic note repository.
        </p>
        <div className="pt-2">
          <Link
            href="/academics"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#1C1917] text-white text-sm font-medium hover:bg-[#231F1C] transition-all shadow-sm"
          >
            View Academics & Courses <ArrowRight className="w-4 h-4 text-[#FDB27C]" />
          </Link>
        </div>
      </section>
    </main>
  );
}
