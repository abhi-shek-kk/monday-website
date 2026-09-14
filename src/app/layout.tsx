import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import FooterClient from "@/components/FooterClient";
import ChatbotWidget from "@/components/ChatbotWidget";
import WebsiteWatermark from "@/components/WebsiteWatermark";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "St. Berchmans College | Department of AI & Data Science",
  description:
    "Official website for the Department of Artificial Intelligence & Data Science at St. Berchmans College, Changanassery, Kerala.",
  keywords: [
    "St. Berchmans College",
    "SB College",
    "Artificial Intelligence",
    "Data Science",
    "BSc AI & Data Science",
    "Changanassery",
    "Kerala Education",
  ],
  icons: {
    icon: "/images/branding/college-icon.png",
    shortcut: "/images/branding/college-icon.png",
    apple: "/images/branding/college-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased bg-[#FBF9F7] dark:bg-[#141210] text-[#1C1917] dark:text-[#FBF9F7] font-sans flex flex-col min-h-screen relative overflow-x-hidden transition-colors duration-200">
        <ThemeProvider>
          <WebsiteWatermark />
          <Navbar />
          <div className="flex-grow relative z-10">{children}</div>
          <FooterClient />
          <ChatbotWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}


