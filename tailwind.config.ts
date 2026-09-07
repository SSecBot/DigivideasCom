import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#1F1F1F",
        foreground: "#FAFAFA",
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#F97316",
          dark: "#EA580C",
        },
        dark: {
          base: "#1F1F1F",
          card: "#282828",
          border: "#333333",
          input: "#333333",
        },
        anthracite: {
          base: "#1F1F1F",
          surface: "#282828",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#444444",
          700: "#333333",
          800: "#282828",
          850: "#242424",
          900: "#1F1F1F",
          950: "#181818",
          DEFAULT: "#1F1F1F",
        },
        slate: {
          700: "#333333",
          800: "#282828",
          850: "#242424",
          900: "#1F1F1F",
          950: "#181818",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "glow-orange": "0 0 40px -10px rgba(249, 115, 22, 0.35)",
        "glow-orange-lg": "0 0 60px -15px rgba(249, 115, 22, 0.5)",
        "glass-anthracite": "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
