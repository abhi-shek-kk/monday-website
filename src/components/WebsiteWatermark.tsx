"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function WebsiteWatermark() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardPage = pathname?.startsWith("/dashboard");

  // Visual opacity fine-tuning:
  // - Login/Register: 2.0% opacity (subtle, allows existing tower sketch to remain primary)
  // - Dashboards: 2.5% opacity (clean, preserves table & form contrast)
  // - Public Pages: 3.5% opacity (elegant, premium institutional branding)
  const opacityClass = isAuthPage
    ? "opacity-[0.02]"
    : isDashboardPage
    ? "opacity-[0.025]"
    : "opacity-[0.035]";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none"
    >
      <div
        className={`relative w-full h-full max-w-[1400px] mx-auto flex items-center justify-center transition-opacity duration-300 ${opacityClass} mix-blend-multiply`}
      >
        <Image
          src="/images/branding/watermark.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-center p-4 sm:p-8 md:p-12"
        />
      </div>
    </div>
  );
}
