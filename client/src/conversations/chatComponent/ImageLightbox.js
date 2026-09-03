import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX, FiDownload } from "react-icons/fi";
import IconButton from "../../components/ui/IconButton";

/* ─────────────────────────────────────────────────────────────
   Full-size image viewer.

   Not built on the shared Modal, which is a 440px panel sized
   for forms; a photo wants the whole viewport and no chrome.
   The behaviour is the same: Escape closes, the backdrop closes,
   focus moves in and is handed back, and the page behind does
   not scroll.
───────────────────────────────────────────────────────────── */

const ImageLightbox = ({ src, alt, onClose }) => {
    const closeRef = useRef(null);
    const restoreRef = useRef(null);

    useEffect(() => {
        restoreRef.current = document.activeElement;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        closeRef.current?.focus();

        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            // Stop the chat shell's Escape handler from also firing.
            e.stopPropagation();
            onClose?.();
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            restoreRef.current?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Image"}
            className="fixed inset-0 z-[200] flex items-center justify-center
                       bg-black/90 backdrop-blur-sm animate-fade-in
                       p-3 sm:p-8"
            // Only a click that starts and ends on the backdrop dismisses.
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="absolute top-0 right-0 z-10 flex items-center gap-1
                            p-2 pt-[max(0.5rem,var(--safe-top))]">
                {/* Opening the original in a tab stays available for anyone who
                    wants to save or zoom it — it is just no longer the only
                    way to look at a photo. */}
                <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open original in a new tab"
                    title="Open original in a new tab"
                    className="inline-flex items-center justify-center flex-shrink-0
                               w-11 h-11 rounded-xl no-underline
                               text-white/70 hover:text-white hover:bg-white/10
                               transition-colors duration-150"
                >
                    <FiDownload size={18} aria-hidden="true" />
                </a>

                <IconButton
                    ref={closeRef}
                    label="Close image"
                    icon={FiX}
                    iconSize={20}
                    size="lg"
                    onClick={onClose}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                />
            </div>

            <img
                src={src}
                alt={alt || "Shared image"}
                className="max-w-full max-h-full object-contain
                           rounded-lg shadow-panel animate-pop-in"
            />
        </div>,
        document.body
    );
};

export default ImageLightbox;
