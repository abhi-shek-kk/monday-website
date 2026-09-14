"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function WebsiteWatermark() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardPage = pathname?.startsWith("/dashboard");

  // Visual opacity & boldness fine-tuning:
  // - Login/Register: 5.0% opacity
  // - Dashboards: 6.5% opacity
  // - Public Pages: 8.5% opacity (prominent, readable institutional watermark)
  const opacityClass = isAuthPage
    ? "opacity-[0.05]"
    : isDashboardPage
    ? "opacity-[0.065]"
    : "opacity-[0.085]";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none"
    >
      <div
        className={`relative w-[96vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-[1600px] aspect-[1652/952] transition-all duration-300 ${opacityClass} mix-blend-multiply filter contrast-[1.2] brightness-[0.9]`}
      >
        <Image
          src="/images/branding/watermark.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 96vw, (max-width: 1024px) 90vw, 80vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
