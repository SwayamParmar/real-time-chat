import React from "react";

/* ─────────────────────────────────────────────────────────────
   Avatar + presence.

   Every avatar in the app used to be hardcoded to one purple
   (#7C6FCD, a colour in neither palette), so a list of ten people
   was ten identical circles. The tint is now derived from the
   user's id, which means it is stable across sessions, devices
   and re-renders without any state or API involvement.
───────────────────────────────────────────────────────────── */

const PALETTE = [
    "#6366F1", // indigo
    "#8B5CF6", // violet
    "#22D3EE", // cyan
    "#34D399", // emerald
    "#F472B6", // pink
    "#FBBF24", // amber
    "#38BDF8", // sky
    "#A78BFA", // light violet
];

/** Cheap, stable string hash — same input always picks the same swatch. */
const tintFor = (seed = "") => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
};

/** Up to two initials, skipping empty segments from double spaces. */
const initialsFor = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// One scale, used everywhere. Sizes were previously 30 / 40 / 42 / 80 with
// no relationship to each other.
const SIZES = {
    xs: { box: "w-8 h-8", text: "text-[11px]", dot: "w-2.5 h-2.5", ring: "1.5px" },
    sm: { box: "w-10 h-10", text: "text-[13px]", dot: "w-3 h-3", ring: "1.5px" },
    md: { box: "w-11 h-11 sm:w-12 sm:h-12", text: "text-sm", dot: "w-3 h-3", ring: "1.5px" },
    lg: { box: "w-14 h-14", text: "text-base", dot: "w-3.5 h-3.5", ring: "2px" },
    xl: { box: "w-20 h-20", text: "text-2xl", dot: "w-4 h-4", ring: "2px" },
};

/**
 * @param {string}  name    display name — drives the initials
 * @param {string}  id      stable identity — drives the tint
 * @param {string}  size    key of SIZES
 * @param {boolean} online  renders the presence dot when true
 */
export const Avatar = ({ name, id, size = "sm", online = false, className = "" }) => {
    const scale = SIZES[size] ?? SIZES.sm;
    const tint = tintFor(id || name || "");

    return (
        <span className={`relative inline-flex flex-shrink-0 ${className}`}>
            <span
                // Decorative: the name is always rendered as text next to it,
                // so announcing the initials again is pure duplication.
                aria-hidden="true"
                className={`${scale.box} ${scale.text} rounded-full flex items-center justify-center
                            font-bold font-mono tracking-wide select-none`}
                style={{
                    background: `${tint}26`,
                    border: `${scale.ring} solid ${tint}66`,
                    color: tint,
                }}
            >
                {initialsFor(name)}
            </span>

            {online && (
                <span
                    aria-hidden="true"
                    className={`${scale.dot} absolute bottom-0 right-0 rounded-full
                                bg-status-online ring-2 ring-surface-panel`}
                />
            )}
        </span>
    );
};

// ─── StatusDot ────────────────────────────────────────────────
// Kept as a standalone export for the places that need presence
// without an avatar (e.g. the room header subtitle).
const STATUS_COLORS = {
    online: "bg-status-online",
    away: "bg-status-away",
    offline: "bg-status-offline",
};

export const StatusDot = ({ status = "offline", className = "" }) => (
    <span
        aria-hidden="true"
        className={`inline-block w-2 h-2 rounded-full flex-shrink-0
                    ${STATUS_COLORS[status] ?? STATUS_COLORS.offline} ${className}`}
    />
);

export default Avatar;
