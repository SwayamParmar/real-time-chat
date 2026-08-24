import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import IconButton from "./IconButton";

/* ─────────────────────────────────────────────────────────────
   Modal / bottom sheet.

   Presentational only — it owns no application state and decides
   nothing about what it contains. It just supplies the behaviour
   every dialog is expected to have and none of ours had:

     • Escape closes it
     • clicking the backdrop closes it
     • background scroll is locked while it is open
     • focus moves in on open and returns to the trigger on close
     • Tab is trapped inside it
     • role="dialog" + aria-modal + a labelled title
     • on phones it docks to the bottom as a sheet instead of
       floating a fixed-width card that overflows a 320px screen

   Rendered through a portal so it is never clipped by a parent's
   overflow:hidden — the old dialog lived inside the chat pane.
───────────────────────────────────────────────────────────── */

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({ open = true, onClose, title, description, children, footer }) => {
    const panelRef = useRef(null);
    const titleId = React.useId();
    const descId = React.useId();

    // Remember whatever had focus so it can be handed back on close.
    const restoreRef = useRef(null);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose?.();
                return;
            }

            if (e.key !== "Tab") return;

            const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
            if (!nodes?.length) return;

            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        },
        [onClose]
    );

    /*
     * Mobile keyboards resize the *visual* viewport, not the layout viewport.
     * A position:fixed sheet therefore keeps its full height and its lower half
     * — including whatever the user just focused — ends up behind the keyboard.
     * Pinning the overlay to the visual viewport makes the sheet ride up with
     * the keyboard the way a native bottom sheet does.
     */
    const [viewport, setViewport] = useState(null);

    useEffect(() => {
        if (!open) return undefined;

        const vv = window.visualViewport;
        if (!vv) return undefined; // Falls back to the full-viewport overlay.

        let frame = 0;
        const sync = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() =>
                setViewport({ top: vv.offsetTop, height: vv.height })
            );
        };

        sync();
        vv.addEventListener("resize", sync);
        vv.addEventListener("scroll", sync);

        return () => {
            cancelAnimationFrame(frame);
            vv.removeEventListener("resize", sync);
            vv.removeEventListener("scroll", sync);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        restoreRef.current = document.activeElement;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Focus the first control, falling back to the panel itself.
        const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
        (nodes?.[0] ?? panelRef.current)?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            restoreRef.current?.focus?.();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            style={viewport ? { top: viewport.top, height: viewport.height } : undefined}
            className="fixed left-0 right-0 top-0 h-full z-[200]
                       flex items-end sm:items-center justify-center
                       bg-black/70 backdrop-blur-sm animate-fade-in
                       p-0 sm:p-6"
            // Backdrop click. The check keeps clicks that originate inside the
            // panel — including a drag that ends on the backdrop — from closing.
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                // max-h-full rather than a dvh value: the overlay is already
                // sized to the visual viewport above, so the sheet shrinks with
                // the keyboard instead of extending behind it.
                className="w-full sm:max-w-[440px] flex flex-col outline-none
                           bg-surface-panel border border-surface-border
                           rounded-t-2xl sm:rounded-2xl shadow-panel
                           max-h-full sm:max-h-[min(620px,85dvh)]
                           animate-sheet-up sm:animate-pop-in
                           pb-safe-b sm:pb-0"
            >
                {/* Grab handle — signals the sheet affordance on touch. */}
                <div className="sm:hidden flex justify-center pt-2.5 pb-1" aria-hidden="true">
                    <span className="w-9 h-1 rounded-full bg-surface-muted" />
                </div>

                {(title || onClose) && (
                    <header className="flex items-start gap-3 px-4 sm:px-5 pt-3 sm:pt-5 pb-3">
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h2
                                    id={titleId}
                                    className="text-chat-primary font-bold text-base tracking-tight m-0 truncate"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id={descId} className="text-chat-faint text-[13px] mt-0.5 m-0">
                                    {description}
                                </p>
                            )}
                        </div>

                        {onClose && (
                            <IconButton label="Close dialog" icon={FiX} onClick={onClose} size="sm" />
                        )}
                    </header>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto scroll-contain">{children}</div>

                {footer && (
                    <footer className="px-4 sm:px-5 py-3 border-t border-surface-border flex-shrink-0">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
