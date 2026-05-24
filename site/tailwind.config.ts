import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"SF Pro Display"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"SF Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      colors: {
        ink: "#02030a",
        aurora: {
          mint: "#80ffd0",
          violet: "#a05aff",
          blue: "#5060ff",
          pink: "#ff7ad0",
        },
      },
      keyframes: {
        auroraFloat: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(2%, -3%) scale(1.05)" },
        },
        orbitDrift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-1%, 1%)" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        auroraFloat: "auroraFloat 14s ease-in-out infinite",
        orbitDrift: "orbitDrift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
