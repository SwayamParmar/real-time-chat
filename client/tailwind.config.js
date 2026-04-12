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
          base: "#0B0D14",   // slightly deeper for more contrast
          panel: "#0F111A",  // tighter, more premium layering
          raised: "#171A26", // smoother elevation
          border: "#1F2333", // clearer separation
          muted: "#262B40",  // hover / subtle states
        },

        // ── Text Colors ─────────────────────────────────────
        chat: {
          primary: "#ECEFF8",   // slightly brighter for readability
          secondary: "#C9D1F0", // cleaner contrast
          muted: "#9AA3C7",     // input / placeholders
          faint: "#5B6280",     // subtitles
          ghost: "#404660",     // timestamps
          dim: "#484E6A",       // message time
        },

        // ── Brand / Accent (UPGRADED — SAME KEYS) ───────────
        brand: {
          DEFAULT: "#6366F1",   // indigo (main identity)
          dark: "#4F46E5",      // stronger active state

          // glow now feels like light, not just opacity
          glow: "rgba(99,102,241,0.35)",

          // improved layered usage
          muted: "rgba(99,102,241,0.18)",
          subtle: "rgba(99,102,241,0.28)",

          // NEW: energy accent (no breaking change)
          accent: "#8B5CF6",     // purple richness
          highlight: "#22D3EE",  // cyan (real-time feel)
        },

        // ── Status Dots (SLIGHTLY PREMIUM-TUNED) ────────────
        status: {
          online: "#34D399",   // softer emerald (less harsh)
          away: "#FBBF24",     // warmer amber
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
          "0%, 60%, 100%": {
            transform: "translateY(0)",
            backgroundColor: "#4A5068"
          },
          "30%": {
            transform: "translateY(-5px)",
            backgroundColor: "#22D3EE" // 🔥 cyan = real-time feedback
          },
        },

        // NEW: subtle pulse for notifications / activity
        pulseSoft: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        }
      },

      animation: {
        "fade-slide-in": "fadeSlideIn 0.2s ease",

        "typing-bounce-0": "typingBounce 1s 0s infinite",
        "typing-bounce-1": "typingBounce 1s 0.2s infinite",
        "typing-bounce-2": "typingBounce 1s 0.4s infinite",

        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },

      boxShadow: {
        panel: "0 6px 20px rgba(0,0,0,0.35)",

        // refined glow (less purple, more indigo realism)
        bubble: "0 6px 18px rgba(99,102,241,0.25)",

        // NEW: subtle cyan interaction glow
        focus: "0 0 0 2px rgba(34,211,238,0.35)",
      }
    },
  },
  plugins: [],
};