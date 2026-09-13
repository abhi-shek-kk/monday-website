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
        className={`relative w-[90vw] sm:w-[80vw] md:w-[75vw] lg:w-[70vw] max-w-[1400px] aspect-[1652/952] transition-opacity duration-300 ${opacityClass} mix-blend-multiply`}
      >
        <Image
          src="/images/branding/watermark.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
