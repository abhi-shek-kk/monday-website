"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF9F7] hover:bg-[#EFEAE3] text-[#1C1917] font-medium text-xs rounded-xl border border-[#EFEAE3] transition-all disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {isLoggingOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
