import { useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   Shared scroll-reveal observer.

   One lazily-created IntersectionObserver for the whole page,
   unobserving each element once it has been revealed. Reveal is
   a CSS class toggle, so scrolling triggers no re-renders.
───────────────────────────────────────────────────────────── */

let observer = null;

const getObserver = () => {
    if (observer) return observer;

    // Guard SSR / non-browser environments (and very old browsers).
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                obs.unobserve(entry.target); // reveal is one-shot
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    return observer;
};

/**
 * Returns a ref callback that reveals the node when it scrolls into view.
 *
 * Usage:  const reveal = useReveal();  <div ref={reveal} className="reveal" />
 *
 * The callback is stable across renders, so React never detaches and
 * re-attaches the ref on re-render.
 */
export const useReveal = () =>
    useCallback((node) => {
        if (!node) return;

        const obs = getObserver();

        // No observer support: show the content rather than hiding it.
        if (!obs) {
            node.classList.add('visible');
            return;
        }

        obs.observe(node);
    }, []);

export default useReveal;
