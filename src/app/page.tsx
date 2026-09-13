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
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-[#FBF9F7] border-b border-[#EFEAE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold tracking-wide">
                First Batch: 2026–2030 &bull; Changanassery, Kerala
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#756860]">
                  St. Berchmans College
                </h2>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#1C1917] tracking-tight leading-[1.15]">
                  Department of <br />
                  <span className="text-[#1C1917] no-underline">
                    Artificial Intelligence
                  </span>{" "}
                  & Data Science
                </h1>
              </div>

              <p className="text-base sm:text-lg text-[#756860] leading-relaxed max-w-2xl font-normal">
                Pioneering academic excellence at St. Berchmans College, Changanassery. Combining foundational computing, algorithmic modeling, deep learning, and practical data analytics for modern technology leaders.
              </p>

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
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#1C1917] text-white font-medium text-sm hover:bg-[#231F1C] transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
                  >
                    Go to {session.role.toLowerCase()} Dashboard <ArrowRight className="w-4 h-4 text-[#FDB27C]" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1C1917] text-white font-medium text-sm hover:bg-[#231F1C] transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
                    >
                      <Shield className="w-4 h-4 text-[#FDB27C]" /> Sign In to Portal
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#1C1917] border border-[#EFEAE3] font-medium text-sm hover:bg-[#EFEAE3]/50 transition-all shadow-xs hover:-translate-y-0.5"
                    >
                      <GraduationCap className="w-4 h-4 text-[#756860]" /> Student Registration
                    </Link>
                  </>
                )}
                <Link
                  href="/academics"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-[#756860] font-medium text-sm hover:text-[#1C1917] transition-colors"
                >
                  Explore Academics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Campus Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none bg-white p-4 sm:p-5 rounded-3xl border border-[#EFEAE3] shadow-sm space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3]">
                  <Image
                    src="/images/home/sb-college-centre.jpg"
                    alt="St. Berchmans College campus"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1C1917]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    St. Berchmans Campus
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-1">
                    <span className="font-bold text-[#1C1917] block">Program Degree</span>
                    <span className="text-[#756860]">BSc AI & Data Science</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-1">
                    <span className="font-bold text-[#1C1917] block">Duration</span>
                    <span className="text-[#756860]">4 Years / 8 Semesters</span>
                  </div>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-[#FBF9F7] border border-[#EFEAE3] shadow-sm">
          <Image
            src="/images/home/sb-college-centre.jpg"
            alt="St. Berchmans College campus building and grounds"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover hover:scale-105 transition-transform duration-700"
          />
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
