import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0D0A",
        surface: "#14160F",
        "surface-2": "#1B1D15",
        line: "rgba(237,234,226,0.08)",
        ink: "#EDEAE2",
        muted: "#8A8578",
        ember: "#FF4A1C",
        amber: "#FFB020",
        zone: "#6C4FF2",
        safe: "#4ADE80",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        shrink: {
          "0%": { opacity: "0", transform: "translate(-50%,-50%) scale(1.05)" },
          "10%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translate(-50%,-50%) scale(0.82)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        shrink: "shrink 9s ease-in-out infinite",
        pulse2: "pulse2 1.6s ease-in-out infinite",
        marquee: "marquee 14s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
