import React from "react";

/* ─────────────────────────────────────────────────────────────
   Loading skeletons.
───────────────────────────────────────────────────────────── */

/** A single shimmering block. */
export const Skeleton = ({ className = "" }) => (
    <span
        aria-hidden="true"
        className={`relative block overflow-hidden rounded-md bg-surface-raised ${className}`}
    >
        <span
            className="absolute inset-0 -translate-x-full animate-shimmer
                       bg-gradient-to-r from-transparent via-[var(--shimmer)] to-transparent"
        />
    </span>
);

// Varying widths, so the rows do not read as one repeating pattern.
const NAME_WIDTHS = ["w-28", "w-20", "w-32", "w-24"];
const LINE_WIDTHS = ["w-3/5", "w-4/5", "w-2/5", "w-3/4"];

/** Placeholder rows for the conversation list. */
export const ConversationSkeleton = ({ rows = 7 }) => (
    <ul className="list-none m-0 p-0" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className={`h-3.5 ${NAME_WIDTHS[i % NAME_WIDTHS.length]}`} />
                        <Skeleton className="h-3 w-10 flex-shrink-0" />
                    </div>
                    <Skeleton className={`h-3 ${LINE_WIDTHS[i % LINE_WIDTHS.length]}`} />
                </div>
            </li>
        ))}
    </ul>
);

const BUBBLE_WIDTHS = ["w-1/2", "w-2/3", "w-2/5", "w-3/5"];

/** Placeholder bubbles for the first load of a conversation. */
export const MessageSkeleton = ({ rows = 6 }) => (
    <div className="flex flex-col gap-3 px-1 py-2" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => {
            const mine = i % 3 === 0;
            return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <Skeleton
                        className={`h-10 max-w-[70%] ${BUBBLE_WIDTHS[i % BUBBLE_WIDTHS.length]}
                                    ${mine ? "rounded-bubble-me" : "rounded-bubble-them"}`}
                    />
                </div>
            );
        })}
    </div>
);

export default Skeleton;
