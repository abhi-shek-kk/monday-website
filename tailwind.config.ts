import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#FBF9F7",
          100: "#EFEAE3",
          200: "#FDB27C",
          700: "#756860",
          900: "#1C1917",
          dark: "#231F1C",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
