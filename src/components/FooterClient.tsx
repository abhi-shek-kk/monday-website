"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterClient() {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute) return null;

  return <Footer />;
}
