import React from 'react';
import {
    FiLayout,
    FiServer,
    FiZap,
    FiDatabase,
    FiFeather,
    FiCode,
    FiKey,
    FiCloud,
    FiRepeat,
    FiShuffle,
} from 'react-icons/fi';
import useReveal from './useReveal';

/* Mirrors the stack described in the repository README. */
const TECH = [
    { Icon: FiLayout, name: 'React 18', role: 'UI Layer', tint: '#22D3EE' },
    { Icon: FiServer, name: 'Node + Express', role: 'API Runtime', tint: '#34D399' },
    { Icon: FiZap, name: 'Socket.IO', role: 'Real-Time', tint: '#6366F1' },
    { Icon: FiDatabase, name: 'MongoDB', role: 'Persistence', tint: '#34D399' },
    { Icon: FiCode, name: 'TypeScript', role: 'Typed Backend', tint: '#8B5CF6' },
    { Icon: FiFeather, name: 'Tailwind CSS', role: 'Design System', tint: '#22D3EE' },
];

const FRONTEND = [
    { Icon: FiLayout, label: 'React 18 + React Router' },
    { Icon: FiFeather, label: 'Tailwind CSS' },
    { Icon: FiRepeat, label: 'Zustand state stores' },
    { Icon: FiZap, label: 'Socket.IO client' },
];

const BACKEND = [
    { Icon: FiServer, label: 'Express on Node (TypeScript)' },
    { Icon: FiZap, label: 'Socket.IO server' },
    { Icon: FiDatabase, label: 'MongoDB + Mongoose' },
    { Icon: FiKey, label: 'JWT middleware' },
    { Icon: FiCloud, label: 'Cloudinary + Multer' },
];

const TechCard = ({ Icon, name, role, tint }) => (
    <div className="card card-lift p-6 text-center">
        <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
            style={{ background: `${tint}1A`, color: tint }}
        >
            <Icon size={22} aria-hidden="true" />
        </span>
        <div className="font-display font-bold text-[13.5px] mb-1" style={{ color: 'var(--chat-primary)' }}>
            {name}
        </div>
        <div className="font-mono text-[11px]" style={{ color: 'var(--chat-faint)' }}>
            {role}
        </div>
    </div>
);

const ArchItem = ({ Icon, label }) => (
    <div
        className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[10px] mb-2 text-[13px]"
        style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            color: 'var(--chat-secondary)',
        }}
    >
        <Icon size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} aria-hidden="true" />
        {label}
    </div>
);

const ArchColumn = ({ title, items }) => (
    <div>
        <div
            className="font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
            style={{ color: 'var(--brand)' }}
        >
            {title}
        </div>
        {items.map((i) => (
            <ArchItem key={i.label} {...i} />
        ))}
    </div>
);

const TechStackSection = () => {
    const revealCards = useReveal();
    const revealArch = useReveal();

    return (
        <section id="tech" className="section overflow-hidden" style={{ background: 'var(--surface-base)' }}>
            <div className="container-ts">
                <header className="section-head">
                    <span className="eyebrow">Tech Stack</span>
                    <h2 className="section-title">
                        Production-grade stack.
                        <br className="hidden sm:block" /> Zero compromises.
                    </h2>
                    <p className="section-sub">
                        Each layer was picked for a reason: a typed backend that fails at compile time,
                        a socket layer that keeps state in sync, and a database shaped around conversations.
                    </p>
                </header>

                {/* Stack cards */}
                <div
                    ref={revealCards}
                    className="reveal grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10 sm:mb-12"
                >
                    {TECH.map((t) => (
                        <TechCard key={t.name} {...t} />
                    ))}
                </div>

                {/* Architecture diagram — stacks vertically on small screens */}
                <div
                    ref={revealArch}
                    className="reveal card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center"
                >
                    <ArchColumn title="Frontend" items={FRONTEND} />

                    {/* Transport */}
                    <div className="flex lg:flex-col items-center justify-center gap-2">
                        <FiShuffle
                            size={18}
                            className="anim-arrow lg:rotate-90"
                            style={{ color: 'var(--brand)' }}
                            aria-hidden="true"
                        />
                        <div
                            className="font-mono text-[11.5px] font-medium text-center px-4 py-[10px] rounded-[10px] leading-snug"
                            style={{
                                background: 'var(--brand-soft)',
                                border: '1px solid var(--brand-subtle)',
                                color: 'var(--brand)',
                            }}
                        >
                            WebSocket
                            <br />
                            Socket.IO
                        </div>
                        <FiShuffle
                            size={18}
                            className="anim-arrow lg:rotate-90"
                            style={{ color: 'var(--brand)' }}
                            aria-hidden="true"
                        />
                    </div>

                    <ArchColumn title="Backend" items={BACKEND} />
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
