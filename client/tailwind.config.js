/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "chat": "1600px"
      },
      colors: {
        // ── Chat Surface Colors ─────────────────────────────
        surface: {
          base: "#0D0F16",   // page / messages bg
          panel: "#111318",   // sidebar + header + input bar
          raised: "#1A1D28",   // input fields, bubbles (them), buttons
          border: "#1E2130",   // panel borders
          muted: "#252A40",   // hover borders, button hover
        },
        // ── Text Colors ─────────────────────────────────────
        chat: {
          primary: "#E8EAF0", // headings
          secondary: "#D0D5E8", // contact names
          muted: "#A0A8C0", // search input text
          faint: "#505870", // subtitles, status text
          ghost: "#3C4260", // timestamps, date separator
          dim: "#404660", // message time (them)
        },
        // ── Brand / Accent ───────────────────────────────────
        brand: {
          DEFAULT: "#7C6FCD",
          dark: "#6057B0",
          glow: "#7C6FCD30",
          muted: "#7C6FCD50",
          subtle: "#7C6FCD60",
        },
        // ── Status Dots ──────────────────────────────────────
        status: {
          online: "#22C55E",
          away: "#F59E0B",
          offline: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        typingBounce: {
          "0%, 60%, 100%": { transform: "translateY(0)", backgroundColor: "#4A5068" },
          "30%": { transform: "translateY(-5px)", backgroundColor: "#7C6FCD" },
        },
      },
      animation: {
        "fade-slide-in": "fadeSlideIn 0.2s ease",
        "typing-bounce-0": "typingBounce 1s 0s   infinite",
        "typing-bounce-1": "typingBounce 1s 0.2s infinite",
        "typing-bounce-2": "typingBounce 1s 0.4s infinite",
      },
      boxShadow: {
        panel: "0 4px 12px rgba(0,0,0,0.3)",
        bubble: "0 4px 10px rgba(124,111,205,0.2)",
      }
    },
  },
  plugins: [],
};
