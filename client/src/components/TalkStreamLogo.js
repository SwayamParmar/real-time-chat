import React from "react";

/* ─────────────────────────────────────────────────────────────
   TalkStream mark.

   Rendered as inline SVG rather than the 195 KB logo_icon.png:
   it costs zero network requests, stays crisp at every size, and
   is painted with the first frame instead of after an image load.
   The gradient keeps the original chevron identity (indigo →
   violet → cyan) and is driven by the shared brand palette.
───────────────────────────────────────────────────────────── */

// Exported on its own for in-app chrome (the nav rail, the mobile list
// header) where the mark is decoration and must NOT be a link back to "/" —
// following it there triggers a full document reload of the chat client.
export const LogoMark = ({ className }) => {
    // Unique per instance so multiple logos on one page don't collide on the
    // gradient id. Colons are stripped because useId emits ":r1:"-style values,
    // which some engines refuse to resolve inside url(#...).
    const id = `ts-logo-${React.useId().replace(/:/g, "")}`;

    return (
        <svg
            viewBox="0 0 48 48"
            role="img"
            aria-label="TalkStream"
            className={className}
            style={{ display: "block", width: "auto" }}
        >
            <defs>
                <linearGradient id={id} x1="4" y1="42" x2="40" y2="8" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="52%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>

            {/* Motion streaks */}
            <path
                d="M3 19h11M6.5 29h8"
                stroke={`url(#${id})`}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
            />

            {/* Chevron */}
            <path
                d="M20 10.5 34.5 24 20 37.5"
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const TalkStreamLogo = ({
    variant = "text", // "text" | "icon"
    size = "h-8",
    textSize = "text-[20px]",
}) => {
    return (
        <a
            href="/"
            aria-label="TalkStream home"
            className={`flex items-center no-underline ${variant === "text" ? "gap-[10px]" : ""
                }`}
        >
            <LogoMark className={size} />

            {variant === "text" && (
                <span
                    className={`font-display font-bold ${textSize} tracking-[-0.02em]`}
                    style={{ color: "var(--chat-primary)" }}
                >
                    Talk<span style={{ color: "var(--brand)" }}>Stream</span>
                </span>
            )}
        </a>
    );
};

export default TalkStreamLogo;