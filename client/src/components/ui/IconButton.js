import React from "react";

/* ─────────────────────────────────────────────────────────────
   Icon-only button.

   A real <button> with a mandatory label and a tap target that
   clears 44px on touch without looking oversized on desktop.
───────────────────────────────────────────────────────────── */

const VARIANTS = {
    // Default chrome button — headers, composer, nav.
    ghost: "text-chat-faint hover:text-chat-primary hover:bg-surface-raised active:bg-surface-muted",
    // Currently-open / toggled-on state.
    active: "text-brand bg-brand/15 hover:bg-brand/20",
    // Primary action — the send button.
    primary: "text-white bg-brand hover:bg-brand-dark active:bg-brand-dark shadow-bubble",
    // Destructive.
    danger: "text-danger hover:bg-danger-soft",
};

const SIZES = {
    // The padding does the touch-target work, so the icon stays compact.
    sm: "w-9 h-9 rounded-lg",
    // 44px on touch, 36px from sm up.
    md: "w-11 h-11 sm:w-9 sm:h-9 rounded-lg",
    lg: "w-11 h-11 rounded-xl",
};

const IconButton = React.forwardRef(
    (
        {
            label,
            icon: Icon,
            iconSize = 18,
            size = "md",
            variant = "ghost",
            chip = false,
            className = "",
            children,
            ...rest
        },
        ref
    ) => {
        const content = Icon ? <Icon size={iconSize} aria-hidden="true" /> : children;

        /*
         * chip: decouples the visual box from the hit box, so the painted
         * control can sit next to a 32px avatar without towering over it while
         * still offering a full 44px target on touch. Without it the button's
         * background *is* its touch area, which is why the compose button
         * looked a size larger than the profile avatar beside it.
         */
        if (chip) {
            return (
                <button
                    ref={ref}
                    type="button"
                    aria-label={label}
                    title={label}
                    className={`inline-flex items-center justify-center flex-shrink-0 group/chip
                                w-11 h-11 sm:w-9 sm:h-9 rounded-lg
                                disabled:opacity-40 disabled:pointer-events-none ${className}`}
                    {...rest}
                >
                    <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                                    inline-flex items-center justify-center
                                    transition-colors duration-150
                                    ${VARIANTS[variant] ?? VARIANTS.ghost}`}
                    >
                        {content}
                    </span>
                </button>
            );
        }

        return (
            <button
                ref={ref}
                type="button"
                aria-label={label}
                title={label}
                className={`
                    inline-flex items-center justify-center flex-shrink-0
                    transition-colors duration-150
                    disabled:opacity-40 disabled:pointer-events-none
                    ${SIZES[size] ?? SIZES.md}
                    ${VARIANTS[variant] ?? VARIANTS.ghost}
                    ${className}
                `}
                {...rest}
            >
                {content}
            </button>
        );
    }
);

IconButton.displayName = "IconButton";

export default IconButton;
