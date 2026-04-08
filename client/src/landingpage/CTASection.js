import React, { useEffect, useRef } from 'react';

const CTASection = () => {
    const innerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.2 }
        );
        if (innerRef.current) observer.observe(innerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            id="cta"
            className="relative text-center overflow-hidden py-[120px] px-6"
            style={{ background: 'var(--surface-base)' }}
        >
            {/* Radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(124,111,205,0.1) 0%, transparent 70%)' }}
            />

            {/* Grid lines */}
            <div className="cta-grid-bg absolute inset-0 pointer-events-none" />

            {/* Content */}
            <div ref={innerRef} className="reveal relative z-[1] max-w-[680px] mx-auto">
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-[6px] font-mono text-[12px] font-medium px-[14px] py-[5px] rounded-full mb-6"
                    style={{ background: 'var(--brand-glow)', border: '1px solid var(--brand-subtle)', color: 'var(--brand)' }}
                >
                    ⚡ Fully open-source
                </div>

                {/* Headline */}
                <h2
                    className="font-syne font-extrabold tracking-[-0.03em] leading-[1.08] mb-4"
                    style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--chat-primary)' }}
                >
                    Ready to see<br />
                    <span className="grad-text">TalkStream</span> in action?
                </h2>

                {/* Sub */}
                <p className="text-[16px] leading-[1.7] mb-10" style={{ color: 'var(--chat-muted)' }}>
                    Explore the live demo, dive into the source code, or reach out to discuss the
                    engineering decisions behind each module.
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-[14px] flex-wrap">
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 text-white font-semibold text-[14.5px] px-6 py-3 rounded-[10px] no-underline transition-all duration-200"
                        style={{ background: 'var(--brand)', boxShadow: '0 0 30px rgba(124,111,205,0.3), 0 4px 12px rgba(0,0,0,0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'none'; }}
                    >
                        ▶ Open Live Demo
                    </a>
                    <a
                        href="https://github.com/SwayamParmar/real-time-chat"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-[14.5px] px-6 py-3 rounded-[10px] no-underline transition-all duration-200"
                        style={{ color: 'var(--chat-secondary)', border: '1px solid var(--surface-border)', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--surface-muted)'; e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--chat-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--chat-secondary)'; }}
                    >
                        ⌥ View on GitHub
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTASection;