import React from "react";

/* ─────────────────────────────────────────────────────────────
   Empty / zero-result state.
───────────────────────────────────────────────────────────── */

const EmptyState = ({ icon: Icon, title, description, action, compact = false }) => (
    <div
        className={`flex flex-col items-center justify-center text-center
                    ${compact ? "gap-2 px-6 py-10" : "gap-4 px-6 py-14"}`}
    >
        {Icon && (
            <span
                aria-hidden="true"
                className={`rounded-2xl flex items-center justify-center
                            bg-brand/10 border border-brand-subtle text-brand
                            ${compact ? "w-11 h-11" : "w-16 h-16"}`}
            >
                <Icon size={compact ? 20 : 28} />
            </span>
        )}

        <div className="max-w-[280px]">
            <p className={`text-chat-secondary font-semibold ${compact ? "text-[12.5px] sm:text-[13px]" : "text-[14px] sm:text-[15px]"}`}>
                {title}
            </p>
            {description && (
                <p className="text-chat-faint text-[12px] sm:text-[13px] leading-relaxed mt-1">
                    {description}
                </p>
            )}
        </div>

        {action}
    </div>
);

export default EmptyState;
