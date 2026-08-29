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
        // Every token below resolves through a CSS variable defined in
        // index.css, so the whole palette follows [data-theme]. Channels are
        // space-separated to keep opacity modifiers (bg-brand/15) working.
        surface: {
          base: 'rgb(var(--surface-base-rgb) / <alpha-value>)',
          panel: 'rgb(var(--surface-panel-rgb) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised-rgb) / <alpha-value>)',
          border: 'rgb(var(--surface-border-rgb) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted-rgb) / <alpha-value>)',
          rail: 'rgb(var(--surface-rail-rgb) / <alpha-value>)',
        },

        chat: {
          primary: 'rgb(var(--chat-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--chat-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--chat-muted-rgb) / <alpha-value>)',
          faint: 'rgb(var(--chat-faint-rgb) / <alpha-value>)',
          ghost: 'rgb(var(--chat-ghost-rgb) / <alpha-value>)',
          dim: 'rgb(var(--chat-dim-rgb) / <alpha-value>)',
        },

        brand: {
          DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark-rgb) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent-rgb) / <alpha-value>)',
          highlight: 'rgb(var(--brand-highlight-rgb) / <alpha-value>)',

          glow: 'rgb(var(--brand-rgb) / 0.35)',
          muted: 'rgb(var(--brand-rgb) / 0.18)',
          subtle: 'rgb(var(--brand-rgb) / 0.28)',
        },

        danger: {
          DEFAULT: 'rgb(var(--danger-rgb) / <alpha-value>)',
          soft: 'rgb(var(--danger-rgb) / 0.12)',
        },

        // Deterministic per-user avatar tints. Saturated enough to read on
        // either theme, so they are not themed.
        avatar: {
          1: '#6366F1', // indigo
          2: '#8B5CF6', // violet
          3: '#22D3EE', // cyan
          4: '#34D399', // emerald
          5: '#F472B6', // pink
          6: '#FBBF24', // amber
          7: '#38BDF8', // sky
          8: '#A78BFA', // light violet
        },

        status: {
          online: 'rgb(var(--status-online-rgb) / <alpha-value>)',
          away: 'rgb(var(--status-away-rgb) / <alpha-value>)',
          offline: 'rgb(var(--status-offline-rgb) / <alpha-value>)',
          seen: 'rgb(var(--status-seen-rgb) / <alpha-value>)',
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
            backgroundColor: "var(--chat-ghost)"
          },
          "30%": {
            transform: "translateY(-5px)",
            backgroundColor: "var(--brand-highlight)"
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
        panel: "var(--shadow-panel)",

        // refined glow (less purple, more indigo realism)
        bubble: "0 6px 18px rgb(var(--brand-rgb) / 0.25)",

        // NEW: subtle cyan interaction glow
        focus: "0 0 0 2px rgb(var(--brand-highlight-rgb) / 0.35)",
      }
    },
  },
  plugins: [],
};

module.exports = config;