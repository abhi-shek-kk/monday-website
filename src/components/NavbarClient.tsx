"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface NavbarClientProps {
  session: {
    username: string;
    role: string;
    status: string;
  } | null;
}

export default function NavbarClient({ session }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const pathname = usePathname();

  // If in dashboard, don't double render navbar if dashboard has its own layout
  const isDashboardRoute = pathname.startsWith("/dashboard");
  if (isDashboardRoute) return null;

  const mainNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/academics", label: "Academics" },
    { href: "/courses", label: "Courses" },
    { href: "/faculty", label: "Faculty" },
    { href: "/students", label: "Students" },
  ];

  const secondaryNavLinks = [
    { href: "/projects", label: "Projects" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

  const getDashboardHref = () => {
    if (!session) return "/login";
    switch (session.role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "FACULTY":
        return "/dashboard/faculty";
      case "STUDENT":
        return "/dashboard/student";
      default:
        return "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F7]/90 backdrop-blur-md border-b border-[#EFEAE3] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/branding/sb-college-logo.jpg"
              alt="St. Berchmans College Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform bg-white p-0.5 border border-[#EFEAE3]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#756860]">
                St. Berchmans College
              </span>
              <span className="text-sm font-bold text-[#1C1917] font-heading tracking-tight group-hover:text-[#756860] transition-colors">
                Dept of AI & Data Science
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {mainNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[#1C1917] bg-[#EFEAE3]/70 font-semibold"
                      : "text-[#756860] hover:text-[#1C1917] hover:bg-[#EFEAE3]/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Dropdown for More Links */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 ${
                  secondaryNavLinks.some((l) => pathname === l.href)
                    ? "text-[#1C1917] bg-[#EFEAE3]/70 font-semibold"
                    : "text-[#756860] hover:text-[#1C1917] hover:bg-[#EFEAE3]/40"
                }`}
              >
                More <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EFEAE3] rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {secondaryNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 text-sm ${
                        pathname === link.href
                          ? "text-[#1C1917] bg-[#FBF9F7] font-semibold"
                          : "text-[#756860] hover:text-[#1C1917] hover:bg-[#FBF9F7]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Action / Search & Session */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 text-[#756860] hover:text-[#1C1917] hover:bg-[#EFEAE3]/50 rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getDashboardHref()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-semibold hover:bg-[#231F1C] transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <UserCheck className="w-4 h-4 text-[#FDB27C]" />
                  Dashboard ({session.role.toLowerCase()})
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1C1917] border border-[#EFEAE3] bg-white hover:bg-[#EFEAE3]/50 transition-all shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#231F1C] transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#FDB27C]" /> Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 text-[#756860] hover:text-[#1C1917] hover:bg-[#EFEAE3]/50 rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#1C1917] hover:bg-[#EFEAE3]/60 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EFEAE3] px-4 pt-2 pb-6 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {allNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "text-[#1C1917] bg-[#EFEAE3] font-semibold"
                      : "text-[#756860] hover:bg-[#FBF9F7]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#EFEAE3] flex flex-col gap-2">
            {session ? (
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C1917] text-white text-sm font-medium"
              >
                <UserCheck className="w-4 h-4 text-[#FDB27C]" />
                Go to {session.role} Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#1C1917] border border-[#EFEAE3] bg-white text-center"
                >
                  <Shield className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#1C1917] text-center"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#FDB27C]" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
