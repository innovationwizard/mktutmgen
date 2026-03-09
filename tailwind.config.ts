import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grupo Orión brand palette — extracted from logo
        orion: {
          50: "#e8ecf4",
          100: "#c5cee3",
          200: "#9eadd0",
          300: "#778cbd",
          400: "#5973ae",
          500: "#3b5a9f",
          600: "#2d4a85",
          700: "#1f3a6b",
          800: "#142b52",
          900: "#0d1d41", // ← exact brand navy
          950: "#08122b",
        },
        // Semantic aliases
        brand: {
          DEFAULT: "#0d1d41",
          light: "#1f3a6b",
          dark: "#08122b",
        },
        surface: {
          DEFAULT: "#f8f9fc",
          raised: "#ffffff",
          sunken: "#f0f2f7",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
