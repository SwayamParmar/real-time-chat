import React, { useEffect, useRef } from 'react';

const steps = [
    {
        icon: '🔐',
        title: 'Authenticate',
        desc: 'User logs in with credentials. JWT token issued and injected into the socket handshake for persistent identity.',
        delay: 0,
    },
    {
        icon: '🔌',
        title: 'Connect Socket',
        desc: 'Socket.io establishes a persistent WebSocket connection. User joins their personal room for targeted events.',
        delay: 100,
    },
    {
        icon: '📤',
        title: 'Emit Event',
        desc: (
            <>
                Client fires{' '}
                <code style={{ color: 'var(--brand)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>message_send</code>.
                {' '}Server validates, persists to MongoDB, emits to recipient&apos;s socket room.
            </>
        ),
        delay: 200,
    },
    {
        icon: '📥',
        title: 'Receive & Render',
        desc: (
            <>
                Recipient&apos;s client receives{' '}
                <code style={{ color: 'var(--brand)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>message_receive</code>.
                {' '}UI updates instantly. Read receipt emitted back to sender.
            </>
        ),
        delay: 300,
    },
];

const StepCard = ({ icon, title, desc, delay, cardRef }) => (
    <div
        ref={cardRef}
        className="reveal px-6 text-center"
        style={{ transitionDelay: `${delay}ms` }}
    >
        <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 relative z-[1] text-[22px] transition-all duration-300 cursor-default"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand)';
                e.currentTarget.style.boxShadow = '0 0 24px var(--brand-glow)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--surface-border)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {icon}
        </div>
        <div className="font-syne font-bold text-[14px] mb-2" style={{ color: 'var(--chat-primary)' }}>{title}</div>
        <div className="text-[12.5px] leading-[1.65]" style={{ color: 'var(--chat-faint)' }}>{desc}</div>
    </div>
);

const HowItWorksSection = () => {
    const cardRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        cardRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section id="how" className="py-[100px] px-6" style={{ background: 'var(--surface-panel)' }}>
            <div className="max-w-[1200px] mx-auto">
                {/* Label */}
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
                    style={{ color: 'var(--brand)' }}>
                    <span className="inline-block w-[18px] h-px" style={{ background: 'var(--brand)' }} />
                    Architecture
                </div>

                <h2 className="font-syne font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
                    style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--chat-primary)' }}>
                    How a message travels<br />from you to them.
                </h2>

                <p className="text-[16px] leading-[1.7] mb-[60px]"
                    style={{ color: 'var(--chat-muted)', maxWidth: 520 }}>
                    A sub-50ms pipeline from keypress to delivery — here's how TalkStream's real-time engine works under the hood.
                </p>

                {/* Steps with connector line */}
                <div className="relative">
                    {/* Connector line */}
                    <div
                        className="absolute top-7 hide-mobile"
                        style={{
                            left: '10%', right: '10%', height: 1,
                            background: 'linear-gradient(90deg, transparent, var(--brand-subtle), var(--brand-subtle), transparent)',
                        }}
                    />

                    <div className="grid grid-cols-4 gap-0">
                        {steps.map((s, i) => (
                            <StepCard
                                key={s.title}
                                {...s}
                                cardRef={el => (cardRefs.current[i] = el)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
