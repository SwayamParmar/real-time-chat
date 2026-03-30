import React, { useEffect, useRef } from 'react';

const features = [
    {
        icon: '⚡',
        title: 'Real-Time Messaging',
        desc: (
            <>
                Bi-directional Socket.io communication. Messages delivered instantly with{' '}
                <code style={{ color: 'var(--brand)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>message_send</code>{' '}
                and{' '}
                <code style={{ color: 'var(--brand)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>message_receive</code>{' '}
                events.
            </>
        ),
    },
    {
        icon: '✍️',
        title: 'Typing Indicator',
        desc: 'Live "User is typing…" state powered by debounced socket events. Start and stop events handled gracefully.',
    },
    {
        icon: '🟢',
        title: 'Online Presence',
        desc: 'Real-time online/offline status with last seen tracking. Updates propagate instantly across all connected clients.',
    },
    {
        icon: '📎',
        title: 'File & Image Uploads',
        desc: 'Drag-and-drop file sharing with preview-before-send, non-blocking upload feedback, and inline attachment panel.',
    },
    {
        icon: '👁️',
        title: 'Read Receipts',
        desc: 'Three-stage message status: Sent → Delivered → Seen. All updated in real-time without polling.',
    },
    {
        icon: '🔢',
        title: 'Unread Badges',
        desc: 'Per-conversation unread counts that update dynamically and reset automatically when a chat is opened.',
    },
    {
        icon: '∞',
        title: 'Infinite Scroll',
        desc: 'Paginated message history — 20 messages loaded initially, older messages fetched on scroll. Smooth and efficient.',
    },
    {
        icon: '✏️',
        title: 'Edit & Delete',
        desc: 'Right-click context menu for message actions. Edit or delete with live updates reflected across all participants.',
    },
    {
        icon: '🔐',
        title: 'JWT Authentication',
        desc: 'Secure session management with JWT tokens. User identity seamlessly maintained across socket connections.',
    },
];

const FeatureCard = ({ icon, title, desc }) => (
    <div
        className="feature-card-glow relative p-8 transition-all duration-250 cursor-default"
        style={{ background: 'var(--surface-base)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-panel)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-base)'; }}
    >
        <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-4 transition-all duration-300"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-subtle)'; e.currentTarget.style.boxShadow = '0 0 20px var(--brand-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {icon}
        </div>
        <div className="font-syne font-bold text-[15px] mb-2" style={{ color: 'var(--chat-primary)' }}>
            {title}
        </div>
        <div className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--chat-faint)' }}>
            {desc}
        </div>
    </div>
);

const FeaturesSection = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        if (gridRef.current) observer.observe(gridRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="features" className="py-[100px] px-6" style={{ background: 'var(--surface-base)' }}>
            <div className="max-w-[1200px] mx-auto">
                {/* Label */}
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
                    style={{ color: 'var(--brand)' }}>
                    <span className="inline-block w-[18px] h-px" style={{ background: 'var(--brand)' }} />
                    Features
                </div>

                <h2 className="font-syne font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
                    style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--chat-primary)' }}>
                    Everything a modern<br />chat platform needs.
                </h2>

                <p className="text-[16px] leading-[1.7] mb-[60px]"
                    style={{ color: 'var(--chat-muted)', maxWidth: 520 }}>
                    Every feature was engineered from scratch — no shortcuts, no third-party chat SDKs. Pure custom implementation.
                </p>

                {/* Features grid */}
                <div
                    ref={gridRef}
                    className="reveal grid grid-cols-3 gap-px rounded-[16px] overflow-hidden"
                    style={{ background: 'var(--surface-border)', border: '1px solid var(--surface-border)' }}
                >
                    {features.map(f => <FeatureCard key={f.title} {...f} />)}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
