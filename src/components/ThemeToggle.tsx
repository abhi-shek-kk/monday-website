"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`p-2 rounded-xl text-[#756860] hover:text-[#1C1917] dark:text-[#A89F91] dark:hover:text-white hover:bg-[#EFEAE3]/50 dark:hover:bg-[#282420] transition-all duration-200 ${className}`}
      >
        <Moon className="w-5 h-5 opacity-0" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`p-2 rounded-xl flex items-center gap-2 text-[#756860] hover:text-[#1C1917] dark:text-[#A89F91] dark:hover:text-white hover:bg-[#EFEAE3]/60 dark:hover:bg-[#282420] border border-transparent hover:border-[#EFEAE3] dark:hover:border-[#38322D] transition-all duration-200 group active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-[#FDB27C] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-[#756860] transition-transform duration-300 group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
