import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Shield, GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white border-t border-[#231F1C] pt-16 pb-12">
      <div className="w-[96%] max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#756860]/20">
          {/* Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/branding/sb-college-logo.jpg"
                alt="St. Berchmans College Logo"
                width={44}
                height={44}
                className="w-11 h-11 object-contain rounded-xl bg-white p-0.5 border border-[#756860]/30"
              />
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FDB27C]">
                  St. Berchmans College
                </h3>
                <p className="text-base font-bold text-white font-heading">
                  Dept of AI & Data Science
                </p>
              </div>
            </div>
            <p className="text-sm text-[#756860] leading-relaxed">
              Empowering future innovators through foundational computer science, modern machine learning, deep data analytics, and ethical AI development.
            </p>
            <div className="flex items-start gap-2 text-xs text-[#756860]">
              <MapPin className="w-4 h-4 text-[#FDB27C] shrink-0 mt-0.5" />
              <span>Changanassery, Kottayam District, Kerala, India</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDB27C] mb-4">
              Public Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#756860]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Department
                </Link>
              </li>
              <li>
                <Link href="/vision" className="hover:text-white transition-colors">
                  Vision & Mission
                </Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">
                  Academic Framework
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="hover:text-white transition-colors">
                  Faculty Directory
                </Link>
              </li>
              <li>
                <Link href="/students" className="hover:text-white transition-colors">
                  Student Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus & Community */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDB27C] mb-4">
              Explore & Engage
            </h4>
            <ul className="space-y-2.5 text-sm text-[#756860]">
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Department Events
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Student Projects
                </Link>
              </li>
              <li>
                <Link href="/sdp" className="hover:text-white transition-colors">
                  Student Development (SDP)
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Department
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Global Site Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Access & Academic Notice */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDB27C]">
              Department Portal
            </h4>
            <p className="text-xs text-[#756860] leading-relaxed">
              Authenticated access for enrolled students, faculty members, and department administrators.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
              >
                <Shield className="w-3.5 h-3.5 text-[#FDB27C]" /> Sign In to Portal
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FDB27C] hover:bg-[#FDB27C]/90 text-[#1C1917] rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student Registration
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#756860]">
          <p>
            &copy; {new Date().getFullYear()} St. Berchmans College — Department of Artificial Intelligence & Data Science. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>First Batch: 2026–2030</span>
            <span>&bull;</span>
            <span>Changanassery, Kerala</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
