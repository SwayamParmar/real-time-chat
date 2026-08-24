/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    // Declared in full (rather than via extend) so the extra 'xs' breakpoint
    // is emitted in ascending order. Tailwind appends extended screens after
    // 2xl, which would let an xs: rule override an sm: rule on wide screens.
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      maxWidth: {
        "chat": "1600px"
      },

      spacing: {
        // Resolved in index.css from env(safe-area-inset-*).
        "safe-t": "var(--safe-top)",
        "safe-b": "var(--safe-bottom)",
        "safe-l": "var(--safe-left)",
        "safe-r": "var(--safe-right)",
        // Minimum comfortable touch target.
        touch: "44px",
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

        // ── Avatar palette ──────────────────────────────────
        // Deterministic per-user avatar tints. Every avatar in the app used
        // to be hardcoded to one off-palette purple, which made two people
        // in a list visually indistinguishable at a glance.
        avatar: {
          1: "#6366F1", // indigo
          2: "#8B5CF6", // violet
          3: "#22D3EE", // cyan
          4: "#34D399", // emerald
          5: "#F472B6", // pink
          6: "#FBBF24", // amber
          7: "#38BDF8", // sky
          8: "#A78BFA", // light violet
        },

        // ── Status Dots (SLIGHTLY PREMIUM-TUNED) ────────────
        status: {
          online: "#34D399",   // softer emerald (less harsh)
          away: "#FBBF24",     // warmer amber
          offline: "#6B7280",
        },
      },

      borderRadius: {
        // Bubble corners: rounded on three sides, tucked on the tail side.
        // Kept at 10px — enough to read as a bubble, tight enough that a long
        // thread does not look like a column of pills.
        "bubble-me": "10px 10px 3px 10px",
        "bubble-them": "10px 10px 10px 3px",
        "bubble-mid-me": "10px 3px 3px 10px",
        "bubble-mid-them": "3px 10px 10px 3px",
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
        },

        // Popovers / dropdowns — fast enough not to feel laggy.
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.96) translateY(4px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },

        // Mobile bottom sheets.
        sheetUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },

        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },

        // Skeleton shimmer sweep.
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        }
      },

      animation: {
        "fade-slide-in": "fadeSlideIn 0.2s ease",

        "typing-bounce-0": "typingBounce 1s 0s infinite",
        "typing-bounce-1": "typingBounce 1s 0.2s infinite",
        "typing-bounce-2": "typingBounce 1s 0.4s infinite",

        "pulse-soft": "pulseSoft 2s ease-in-out infinite",

        "pop-in": "popIn 0.14s cubic-bezier(0.16,1,0.3,1)",
        "sheet-up": "sheetUp 0.22s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fadeIn 0.15s ease",
        shimmer: "shimmer 1.6s infinite",
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

module.exports = config;