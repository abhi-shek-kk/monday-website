export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getPublicFacultyProfiles } from "@/lib/services/faculty.service";
import { getPublicEvents } from "@/lib/services/event.service";
import { getFeaturedProjects } from "@/lib/services/project.service";
import { getPublicGalleryItems } from "@/lib/services/gallery.service";
import {
  Sparkles,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  Calendar,
  FolderKanban,
  MapPin,
  BrainCircuit,
  Database,
  Award,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  // Fetch dynamic content from Prisma database
  const [facultyList, eventsList, projectsList, galleryList] = await Promise.all([
    getPublicFacultyProfiles().catch(() => []),
    getPublicEvents().catch(() => []),
    getFeaturedProjects().catch(() => []),
    getPublicGalleryItems().catch(() => []),
  ]);

  return (
    <main className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center pt-16 sm:pt-24 pb-16 border-b border-[#EFEAE3]">
        {/* Background Image IMG_04.jpg */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/IMG_04.jpg"
            alt="St. Berchmans College campus background"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center contrast-[1.02]"
          />
          {/* Subtle Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 md:to-white/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Batch Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDB27C]/30 backdrop-blur-sm border border-[#FDB27C]/50 text-[#1C1917] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" /> FIRST BATCH 2026–2030 &bull; CHANGANASSERY, KERALA
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#1C1917] tracking-tight leading-[1.12]">
                BSc. Artificial Intelligence <br />
                <span className="text-[#EA580C] sm:inline block">
                  & Data Science
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#574E46] leading-relaxed max-w-2xl font-medium">
              Department of AI & Data Science at <strong className="text-[#1C1917] font-semibold">St. Berchmans College</strong>, Changanassery &mdash; shaping the future of technology, one mind at a time.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {session ? (
                <Link
                  href={
                    session.role === "ADMIN"
                      ? "/dashboard/admin"
                      : session.role === "FACULTY"
                      ? "/dashboard/faculty"
                      : "/dashboard/student"
                  }
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1C1917] text-white font-medium text-sm hover:bg-[#231F1C] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Go to {session.role.toLowerCase()} Dashboard <ArrowRight className="w-4 h-4 text-[#FDB27C]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1917] text-white font-medium text-sm hover:bg-[#231F1C] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Explore Program <ArrowRight className="w-4 h-4 text-[#FDB27C]" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/70 backdrop-blur-md text-[#1C1917] border border-white/80 font-medium text-sm hover:bg-white transition-all shadow-xs hover:-translate-y-0.5"
                  >
                    About the Department
                  </Link>
                </>
              )}
              <Link
                href="/academics"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-[#574E46] font-medium text-sm hover:text-[#1C1917] transition-colors"
              >
                Explore Academics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Statistics Bar */}
            <div className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm max-w-2xl">
                <div className="text-center space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C]">4</div>
                  <div className="text-xs font-medium text-[#756860]">Year Program</div>
                </div>
                <div className="text-center space-y-0.5 border-l border-[#EFEAE3]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C]">2026</div>
                  <div className="text-xs font-medium text-[#756860]">Established</div>
                </div>
                <div className="text-center space-y-0.5 sm:border-l border-[#EFEAE3]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C]">40+</div>
                  <div className="text-xs font-medium text-[#756860]">Students</div>
                </div>
                <div className="text-center space-y-0.5 border-l border-[#EFEAE3]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C]">6</div>
                  <div className="text-xs font-medium text-[#756860]">Core Subjects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENT INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFEAE3] shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
                Department Identity
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#1C1917]">
                Educating Technological Visionaries with Ethical Purpose
              </h2>
              <p className="text-base text-[#756860] leading-relaxed">
                Established under St. Berchmans College, Changanassery, the Department of Artificial Intelligence & Data Science prepares students to navigate the rapidly evolving domain of intelligent computing, statistical modeling, machine learning, and ethical data science.
              </p>
            </div>
            <div className="lg:col-span-5 relative w-full h-56 rounded-2xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3]">
              <Image
                src="/images/home/sb-college-left.jpg"
                alt="View of St. Berchmans College campus"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-[#1C1917]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                Campus View
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917] font-heading">AI & Machine Learning</h3>
              <p className="text-sm text-[#756860] leading-relaxed">
                Hands-on exposure to neural networks, computer vision, natural language processing, and predictive analytics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917] font-heading">Data Engineering</h3>
              <p className="text-sm text-[#756860] leading-relaxed">
                Scalable data structures, SQL & NoSQL architectures, algorithm optimization, and data visualization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917] font-heading">Academic Ethics</h3>
              <p className="text-sm text-[#756860] leading-relaxed">
                Emphasis on ethical AI deployment, practical capstone projects, research discipline, and leadership values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPUS SHOWCASE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#EFEAE3] shadow-sm">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3]">
            <Image
              src="/images/home/sb-college-centre.jpg"
              alt="St. Berchmans College campus building and grounds"
              fill
              priority
              quality={95}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
            />
          </div>
        </div>
      </section>

      {/* FACULTY PREVIEW (DB BACKED WITH HONEST EMPTY STATE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EFEAE3] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
              Department Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              Faculty Profiles
            </h2>
          </div>
          <Link
            href="/faculty"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#756860] inline-flex items-center gap-1 transition-colors"
          >
            View All Faculty <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {facultyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facultyList.slice(0, 3).map((item: any) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1C1917] text-white flex items-center justify-center font-serif text-lg font-bold">
                  {item.facultyProfile?.fullName.charAt(0) || "F"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1917]">{item.facultyProfile?.fullName}</h3>
                  <p className="text-xs font-semibold text-[#756860]">{item.facultyProfile?.designation}</p>
                </div>
                <p className="text-xs text-[#756860] line-clamp-2">{item.facultyProfile?.qualification}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-[#EFEAE3] text-center space-y-2">
            <Users className="w-8 h-8 text-[#756860] mx-auto opacity-40" />
            <p className="text-sm font-medium text-[#1C1917]">
              Faculty profiles will be available here as the department directory is updated.
            </p>
            <p className="text-xs text-[#756860]">
              Verified faculty accounts are provisioned directly by administration.
            </p>
          </div>
        )}
      </section>

      {/* EVENTS PREVIEW (DB BACKED WITH HONEST EMPTY STATE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EFEAE3] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
              Campus Life
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#756860] inline-flex items-center gap-1 transition-colors"
          >
            View Events Calendar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {eventsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventsList.slice(0, 3).map((event: any) => (
              <div key={event.id} className="p-6 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-3">
                <div className="text-xs font-semibold text-[#FDB27C] bg-[#1C1917] px-3 py-1 rounded-md inline-block">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-lg font-bold text-[#1C1917]">{event.title}</h3>
                <p className="text-xs text-[#756860] line-clamp-3">{event.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-[#EFEAE3] text-center space-y-2">
            <Calendar className="w-8 h-8 text-[#756860] mx-auto opacity-40" />
            <p className="text-sm font-medium text-[#1C1917]">
              No upcoming events have been published yet.
            </p>
            <p className="text-xs text-[#756860]">
              Official department announcements and academic events will be posted here.
            </p>
          </div>
        )}
      </section>

      {/* FEATURED PROJECTS PREVIEW (DB BACKED WITH HONEST EMPTY STATE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EFEAE3] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#756860]">
              Student Innovation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#756860] inline-flex items-center gap-1 transition-colors"
          >
            Explore Projects Showcase <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {projectsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsList.slice(0, 3).map((project: any) => (
              <div key={project.id} className="p-6 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Featured Project
                </span>
                <h3 className="text-lg font-bold text-[#1C1917]">{project.title}</h3>
                <p className="text-xs text-[#756860] line-clamp-3">{project.description}</p>
                <div className="text-xs text-[#756860] pt-2 border-t border-[#EFEAE3]">
                  By <strong className="text-[#1C1917]">{project.student.fullName}</strong> ({project.student.batch})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-[#EFEAE3] text-center space-y-2">
            <FolderKanban className="w-8 h-8 text-[#756860] mx-auto opacity-40" />
            <p className="text-sm font-medium text-[#1C1917]">
              No student projects have been published yet.
            </p>
            <p className="text-xs text-[#756860]">
              Student projects will be featured here as students build their portfolios.
            </p>
          </div>
        )}
      </section>

      {/* LOCATION & PORTAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-12 space-y-8 border border-[#231F1C]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FDB27C] text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" /> St. Berchmans College &bull; Changanassery
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                Join the Department Community
              </h2>
              <p className="text-sm sm:text-base text-[#756860] max-w-2xl">
                Enrolled students and department faculty members can access course notes, project portfolios, and administrative tools through the authenticated portal.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#FDB27C] text-[#1C1917] font-bold text-sm hover:bg-[#FDB27C]/90 transition-all shadow-sm"
              >
                <Shield className="w-4 h-4" /> Sign In to Portal
              </Link>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all border border-white/10"
              >
                <GraduationCap className="w-4 h-4 text-[#FDB27C]" /> Student Registration
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
