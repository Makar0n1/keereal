import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Engineering-grade dark palette with a single accent.
        bg: {
          DEFAULT: "#0a0a0b",
          soft: "#141418",
          card: "#1f1f26",
          border: "#33333d",
        },
        fg: {
          DEFAULT: "#ededef",
          muted: "#a1a1aa",
          faint: "#6b6b73",
        },
        accent: {
          DEFAULT: "#5b8cff",
          soft: "#3a5bbf",
          glow: "rgba(91, 140, 255, 0.16)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "72rem",
        prose: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bubble: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "reaction-pop": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "60%": { transform: "scale(1.25)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "context-pop": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "msg-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(91,140,255,0)", transform: "scale(1)" },
          "10%": { boxShadow: "0 0 0 5px rgba(91,140,255,0.5)", transform: "scale(1.05)" },
          "28%": { boxShadow: "0 0 0 4px rgba(91,140,255,0.38)", transform: "scale(1)" },
          "78%": { boxShadow: "0 0 0 4px rgba(91,140,255,0.32)", transform: "scale(1)" },
          "100%": { boxShadow: "0 0 0 0 rgba(91,140,255,0)", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        bubble: "bubble 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reaction-pop": "reaction-pop 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        "context-pop": "context-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        "msg-pulse": "msg-pulse 1.9s ease-out",
      },
    },
  },
  plugins: [typography],
};

export default config;
