import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiArrowRight,
    FiGithub,
    FiSearch,
    FiSmile,
    FiPaperclip,
    FiSend,
    FiMoreHorizontal,
    FiCheck,
    FiUsers,
    FiImage,
} from 'react-icons/fi';

/* ─── Sub-components ─────────────────────────────────────────── */

const HeroPill = ({ label }) => <span className="pill">{label}</span>;

/* ─── Conversation row in the mockup sidebar ─── */
const ConvoItem = ({ initials, name, preview, badge, statusColor, avatarColor, active }) => (
    <div
        className="flex items-center gap-[9px] px-3 py-2 transition-colors duration-150"
        style={{ background: active ? 'var(--surface-raised)' : 'transparent' }}
    >
        <div
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
            style={{ background: `${avatarColor}22`, color: avatarColor }}
        >
            {initials}
            <span
                className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full border-2"
                style={{ background: statusColor, borderColor: 'var(--surface-panel)' }}
            />
        </div>

        <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--chat-secondary)' }}>
                {name}
            </div>
            <div className="text-[10.5px] truncate" style={{ color: 'var(--chat-faint)' }}>
                {preview}
            </div>
        </div>

        {badge && (
            <span
                className="font-mono text-[9px] font-bold px-[5px] py-[1px] rounded-lg text-white flex-shrink-0"
                style={{ background: 'var(--brand)' }}
            >
                {badge}
            </span>
        )}
    </div>
);

/* ─── Chat bubble in the mockup ─── */
const Msg = ({ from, children, time, showImg }) => {
    const isMe = from === 'me';

    return (
        <div className={`flex flex-col max-w-[78%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
            <div
                className="px-3 py-2 text-[12px] leading-[1.5]"
                style={{
                    background: isMe ? 'var(--brand)' : 'var(--surface-raised)',
                    color: isMe ? '#fff' : 'var(--chat-secondary)',
                    borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    boxShadow: isMe ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                }}
            >
                {showImg && (
                    <div
                        className="w-[120px] h-[74px] rounded-lg mb-[6px] flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--surface-muted), var(--surface-raised))',
                            color: 'var(--chat-muted)',
                        }}
                    >
                        <FiImage size={20} aria-hidden="true" />
                    </div>
                )}
                {children}
            </div>

            <div
                className="text-[9.5px] mt-[3px] flex gap-1 items-center"
                style={{ color: isMe ? 'rgba(255,255,255,0.45)' : 'var(--chat-ghost)' }}
            >
                {time}
                {isMe && (
                    <span className="inline-flex items-center -space-x-[5px]" aria-label="Seen">
                        <FiCheck size={10} aria-hidden="true" />
                        <FiCheck size={10} aria-hidden="true" />
                    </span>
                )}
            </div>
        </div>
    );
};

/* ─── Floating badge around the mockup ─── */
const FloatingBadge = ({ icon, label, className, animClass }) => (
    <div
        className={`absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-[10px]
            text-[12px] font-medium z-10 whitespace-nowrap ${animClass} ${className}`}
        style={{
            background: 'var(--surface-panel)',
            border: '1px solid var(--surface-border)',
            color: 'var(--chat-secondary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
    >
        {icon}
        {label}
    </div>
);

/* ─── Data ───────────────────────────────────────────────────── */

const PILLS = ['Socket.IO', 'TypeScript', 'React 18', 'Node.js', 'MongoDB', 'JWT Auth'];

const CONVOS = [
    { initials: 'AR', name: 'Arav R.', preview: 'sent an image', badge: '3', statusColor: 'var(--status-online)', avatarColor: '#6366F1', active: true },
    { initials: 'SN', name: 'Sara N.', preview: 'typing…', badge: null, statusColor: 'var(--status-online)', avatarColor: '#22D3EE', active: false },
    { initials: 'KP', name: 'Kiran P.', preview: 'Sure, see you then!', badge: null, statusColor: 'var(--status-away)', avatarColor: '#FBBF24', active: false },
    { initials: 'DM', name: 'Dev M.', preview: 'Thanks!', badge: null, statusColor: 'var(--status-offline)', avatarColor: '#8B5CF6', active: false },
];

/* ─────────────────── HERO SECTION ─────────────────── */
const HeroSection = () => (
    <section
        className="relative flex items-center overflow-hidden px-5 sm:px-6"
        style={{ paddingTop: 'clamp(104px, 14vh, 140px)', paddingBottom: 'clamp(64px, 9vw, 96px)' }}
    >
        {/* Decorative background */}
        <div className="grid-bg" aria-hidden="true" />

        <div
            className="orb hidden md:block"
            aria-hidden="true"
            style={{
                width: 700,
                height: 700,
                left: -240,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)',
            }}
        />
        <div
            className="orb hidden md:block"
            aria-hidden="true"
            style={{
                width: 600,
                height: 600,
                right: -140,
                top: '24%',
                background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)',
            }}
        />

        <div className="container-ts relative z-[1] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-14 items-center">

            {/* ── Left: copy ── */}
            <div className="max-w-[560px] mx-auto lg:mx-0 text-center lg:text-left">
                {/* Headline */}
                <h1
                    className="font-display font-extrabold leading-[1.06] tracking-[-0.03em] mb-5 hero-entry hero-entry-d1"
                    style={{ fontSize: 'clamp(34px, 5.4vw, 58px)', color: 'var(--chat-primary)', textWrap: 'balance' }}
                >
                    Messaging that feels
                    <br />
                    <span className="grad-text">instant</span>, because it is.
                </h1>

                {/* Subtext */}
                <p
                    className="text-[16px] leading-[1.7] mb-8 max-w-[480px] mx-auto lg:mx-0 hero-entry hero-entry-d2"
                    style={{ color: 'var(--chat-muted)', textWrap: 'pretty' }}
                >
                    TalkStream is a production-grade chat platform — live typing indicators,
                    read receipts, presence, and media sharing over a persistent WebSocket
                    connection. No chat SDKs, no polling. Built end to end.
                </p>

                {/* Tech pills */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start hero-entry hero-entry-d3">
                    {PILLS.map((p) => (
                        <HeroPill key={p} label={p} />
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex gap-3 flex-wrap justify-center lg:justify-start hero-entry hero-entry-d4">
                    <Link to="/register" className="btn btn-primary">
                        Start chatting free
                        <FiArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <a
                        href="https://github.com/SwayamParmar/real-time-chat"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                    >
                        <FiGithub size={16} aria-hidden="true" />
                        View source
                    </a>
                </div>

                {/* Trust line */}
                <p
                    className="text-[13px] mt-6 hero-entry hero-entry-d5"
                    style={{ color: 'var(--chat-faint)' }}
                >
                    Free forever · No credit card · Your account is ready in seconds
                </p>
            </div>

            {/* ── Right: product mockup ── */}
            <div className="relative w-full hero-entry hero-entry-d3">
                <div
                    className="orb hidden lg:block"
                    aria-hidden="true"
                    style={{
                        inset: -40,
                        width: 'auto',
                        height: 'auto',
                        borderRadius: 0,
                        background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(99,102,241,0.14) 0%, transparent 70%)',
                    }}
                />

                {/* Floating badges — desktop only, they have no room on phones */}
                <FloatingBadge
                    icon={<FiUsers size={14} style={{ color: 'var(--status-online)' }} aria-hidden="true" />}
                    label="3 users online"
                    className="top-[-16px] right-5"
                    animClass="anim-float"
                />
                <FloatingBadge
                    icon={<FiCheck size={14} style={{ color: 'var(--brand-highlight)' }} aria-hidden="true" />}
                    label="Message seen"
                    className="bottom-[64px] left-[-24px]"
                    animClass="anim-float-d1"
                />
                <FloatingBadge
                    icon={<FiPaperclip size={14} style={{ color: 'var(--brand-accent)' }} aria-hidden="true" />}
                    label="File shared"
                    className="bottom-[-16px] right-10"
                    animClass="anim-float-d2"
                />

                {/* Window */}
                <div
                    className="relative w-full max-w-[560px] mx-auto rounded-[18px] overflow-hidden"
                    style={{
                        background: 'var(--surface-panel)',
                        border: '1px solid var(--surface-border)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                    }}
                >
                    {/* Title bar */}
                    <div
                        className="flex items-center justify-between px-4 py-[13px]"
                        style={{ borderBottom: '1px solid var(--surface-border)' }}
                    >
                        <div className="flex gap-[6px]">
                            <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#FF5F57' }} />
                            <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#FEBC2E' }} />
                            <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#28C840' }} />
                        </div>
                        <span className="font-mono text-[11px]" style={{ color: 'var(--chat-faint)' }}>
                            talkstream.app
                        </span>
                        <div className="w-[54px]" />
                    </div>

                    {/* Body */}
                    <div className="flex h-[340px] sm:h-[380px]">

                        {/* Sidebar — hidden on narrow screens so the thread stays readable */}
                        <div
                            className="hidden sm:block w-[180px] flex-shrink-0 py-[10px]"
                            style={{ borderRight: '1px solid var(--surface-border)' }}
                        >
                            <div
                                className="mx-[10px] mb-[10px] rounded-lg px-[10px] py-[6px] flex items-center gap-[6px] text-[11px]"
                                style={{ background: 'var(--surface-raised)', color: 'var(--chat-faint)' }}
                            >
                                <FiSearch size={12} aria-hidden="true" />
                                Search…
                            </div>
                            {CONVOS.map((c) => (
                                <ConvoItem key={c.name} {...c} />
                            ))}
                        </div>

                        {/* Thread */}
                        <div className="flex-1 min-w-0 flex flex-col" style={{ background: 'var(--surface-base)' }}>

                            {/* Thread header */}
                            <div
                                className="flex items-center gap-[10px] px-4 py-3"
                                style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}
                            >
                                <div
                                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold"
                                    style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--brand)' }}
                                >
                                    AR
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-semibold" style={{ color: 'var(--chat-primary)' }}>
                                        Arav R.
                                    </div>
                                    <div className="text-[10.5px] flex items-center gap-[5px]" style={{ color: 'var(--status-online)' }}>
                                        <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'currentColor' }} />
                                        Online
                                    </div>
                                </div>
                                <FiMoreHorizontal size={16} style={{ color: 'var(--chat-faint)' }} aria-hidden="true" />
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-hidden px-3 py-[14px] flex flex-col gap-2">
                                <Msg from="them" time="10:42 AM">Hey! Can you check the latest design?</Msg>
                                <Msg from="me" time="10:44 AM" showImg>Here&apos;s the updated UI file</Msg>
                                <Msg from="them" time="10:45 AM">Looks great — loving the dark theme.</Msg>
                                <Msg from="me" time="10:46 AM">Shipped it this morning.</Msg>

                                {/* Typing indicator */}
                                <div
                                    className="flex items-center gap-[6px] px-3 py-2 self-start"
                                    style={{ background: 'var(--surface-raised)', borderRadius: '12px 12px 12px 4px' }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className={`block w-[6px] h-[6px] rounded-full anim-typing-${i}`}
                                            style={{ background: 'var(--chat-faint)' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Composer */}
                            <div
                                className="flex items-center gap-2 px-3 py-[10px]"
                                style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}
                            >
                                <FiSmile size={16} style={{ color: 'var(--chat-faint)' }} aria-hidden="true" />
                                <FiPaperclip size={16} style={{ color: 'var(--chat-faint)' }} aria-hidden="true" />
                                <div
                                    className="flex-1 min-w-0 rounded-[10px] px-3 py-[7px] text-[11.5px] truncate"
                                    style={{ background: 'var(--surface-raised)', color: 'var(--chat-muted)' }}
                                >
                                    Type a message…
                                </div>
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                                    style={{ background: 'var(--brand)', boxShadow: '0 0 12px var(--brand-glow)' }}
                                >
                                    <FiSend size={13} aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default HeroSection;
