import React from 'react';

/* ── Small sub-components ── */

const HeroPill = ({ label }) => (
    <span
        className="font-mono text-[11px] px-[10px] py-[4px] rounded-[6px] tracking-[0.03em]"
        style={{ color: 'var(--chat-faint)', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
    >
        {label}
    </span>
);

const BtnPrimary = ({ href, children }) => (
    <a
        href={href}
        className="inline-flex items-center gap-2 text-white font-semibold text-[14.5px] px-6 py-3 rounded-[10px] no-underline transition-all duration-200"
        style={{ background: 'var(--brand)', boxShadow: '0 0 30px rgba(124,111,205,0.3), 0 4px 12px rgba(0,0,0,0.3)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,111,205,0.4), 0 8px 20px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(124,111,205,0.3), 0 4px 12px rgba(0,0,0,0.3)'; }}
    >
        {children}
    </a>
);

const BtnSecondary = ({ href, children, target }) => (
    <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        className="inline-flex items-center gap-2 font-medium text-[14.5px] px-6 py-3 rounded-[10px] no-underline transition-all duration-200"
        style={{ color: 'var(--chat-secondary)', border: '1px solid var(--surface-border)', background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--surface-muted)'; e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--chat-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--chat-secondary)'; }}
    >
        {children}
    </a>
);

/* ── Typing Indicator ── */
const TypingIndicator = () => (
    <div
        className="flex items-center gap-[6px] px-3 py-2 rounded-xl self-start w-fit"
        style={{ background: 'var(--surface-raised)', borderBottomLeftRadius: '4px' }}
    >
        {[0, 1, 2].map(i => (
            <span
                key={i}
                className="block w-[6px] h-[6px] rounded-full"
                style={{ background: 'var(--chat-faint)' }}
            // Tailwind animation classes from your config
            // Using inline style as fallback for custom keyframe
            // Use your own Tailwind animation classes: animate-typing-bounce-0 etc.
            />
        ))}
    </div>
);

/* ── Conversation Item ── */
const ConvoItem = ({ initials, name, preview, badge, statusColor, avatarColor, active }) => (
    <div
        className={`flex items-center gap-[9px] px-3 py-2 cursor-pointer transition-all duration-150`}
        style={{ background: active ? 'var(--surface-raised)' : 'transparent' }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(26,29,40,0.5)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
            style={{ background: avatarColor + '22', color: avatarColor }}>
            {initials}
            <span className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full border-2"
                style={{ background: statusColor, borderColor: 'var(--surface-panel)' }} />
        </div>
        {/* Meta */}
        <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--chat-secondary)' }}>{name}</div>
            <div className="text-[10.5px] truncate" style={{ color: 'var(--chat-faint)' }}>{preview}</div>
        </div>
        {badge && (
            <span className="font-mono text-[9px] font-bold px-[5px] py-[1px] rounded-lg text-white flex-shrink-0"
                style={{ background: 'var(--brand)' }}>
                {badge}
            </span>
        )}
    </div>
);

/* ── Chat Message ── */
const Msg = ({ from, children, time, showImg }) => {
    const isMe = from === 'me';
    return (
        <div className={`flex flex-col max-w-[72%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
            <div
                className={`px-3 py-2 text-[12px] leading-[1.5] rounded-xl`}
                style={{
                    background: isMe ? 'var(--brand)' : 'var(--surface-raised)',
                    color: isMe ? '#fff' : 'var(--chat-secondary)',
                    borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    boxShadow: isMe ? '0 4px 12px rgba(124,111,205,0.3)' : 'none',
                }}
            >
                {showImg && (
                    <div className="w-[120px] h-[75px] rounded-lg mb-1 flex items-center justify-center text-[18px]"
                        style={{ background: 'linear-gradient(135deg, var(--surface-muted), var(--surface-raised))' }}>
                        🖼️
                    </div>
                )}
                {children}
            </div>
            <div className="text-[9.5px] mt-[3px] flex gap-1 items-center"
                style={{ color: isMe ? 'rgba(255,255,255,0.45)' : 'var(--chat-ghost)' }}>
                {time}{isMe && ' ✓✓'}
            </div>
        </div>
    );
};

/* ── Floating Badge ── */
const FloatingBadge = ({ icon, label, className, delayClass }) => (
    <div
        className={`absolute flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12px] font-medium z-10 whitespace-nowrap ${delayClass || 'anim-float'} ${className}`}
        style={{
            background: 'var(--surface-panel)',
            border: '1px solid var(--surface-border)',
            color: 'var(--chat-secondary)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            animation: `float-badge 3s ease-in-out ${delayClass === 'anim-float-d1' ? '1s' : delayClass === 'anim-float-d2' ? '2s' : '0s'} infinite`,
        }}
    >
        <span className="text-[15px]">{icon}</span>
        {label}
    </div>
);

/* ─────────────────── HERO SECTION ─────────────────── */
const HeroSection = () => {
    const pills = ['Socket.io', 'Node.js', 'React', 'MongoDB', 'JWT Auth', 'REST API'];

    const convos = [
        { initials: 'AR', name: 'Arav R.', preview: 'sent an image', badge: '3', statusColor: 'var(--status-online)', avatarColor: '#7C6FCD', active: true },
        { initials: 'SN', name: 'Sara N.', preview: 'typing...', badge: null, statusColor: 'var(--status-online)', avatarColor: '#46A282', active: false },
        { initials: 'KP', name: 'Kiran P.', preview: 'Sure, see you then!', badge: null, statusColor: 'var(--status-away)', avatarColor: '#F59E0B', active: false },
        { initials: 'DM', name: 'Dev M.', preview: 'Thanks!', badge: null, statusColor: 'var(--status-offline)', avatarColor: '#6B7280', active: false },
    ];

    return (
        <section
            className="relative min-h-screen flex items-center overflow-hidden"
            style={{ padding: '120px 24px 80px' }}
        >
            {/* Grid Background */}
            <div className="hero-grid-bg" />

            {/* Glow orbs */}
            <div className="absolute pointer-events-none"
                style={{
                    width: 700, height: 700, left: -200, top: '50%', transform: 'translateY(-50%)',
                    background: 'radial-gradient(circle, rgba(124,111,205,0.12) 0%, transparent 65%)'
                }} />
            <div className="absolute pointer-events-none"
                style={{
                    width: 600, height: 600, right: -100, top: '30%',
                    background: 'radial-gradient(circle, rgba(70,162,130,0.07) 0%, transparent 65%)'
                }} />

            <div className="max-w-[1200px] mx-auto w-full grid grid-cols-2 gap-[60px] items-center relative z-[1] hide-mobile-grid">

                {/* ── Left Copy ── */}
                <div>
                    {/* Label */}
                    <div
                        className="inline-flex items-center gap-2 rounded-full mb-7 text-[12.5px] font-medium hero-entry hero-entry-d0"
                        style={{
                            background: 'rgba(124,111,205,0.08)', border: '1px solid rgba(124,111,205,0.2)',
                            padding: '5px 14px 5px 8px', color: 'var(--brand)'
                        }}
                    >
                        <span className="w-[6px] h-[6px] rounded-full anim-pulse-dot"
                            style={{ background: 'var(--status-online)', flexShrink: 0 }} />
                        Full-Stack Real-Time Chat Application
                    </div>

                    {/* H1 */}
                    <h1
                        className="font-syne font-extrabold leading-[1.08] tracking-[-0.03em] mb-5 hero-entry hero-entry-d1"
                        style={{ fontSize: 'clamp(36px, 5vw, 58px)', color: 'var(--chat-primary)' }}
                    >
                        Real-Time Chat.<br />
                        <span style={{ color: 'var(--brand)' }}>Built for Speed.</span><br />
                        <span style={{ color: 'var(--chat-secondary)', opacity: 0.7 }}>Designed for Scale.</span>
                    </h1>

                    {/* Subtext */}
                    <p
                        className="text-[16px] leading-[1.7] mb-9 max-w-[430px] font-normal hero-entry hero-entry-d2"
                        style={{ color: 'var(--chat-muted)' }}
                    >
                        TalkStream is a production-grade messaging platform with live typing indicators,
                        file sharing, read receipts, online presence, and an infinitely scrollable message
                        history — all powered by Socket.io and Node.js.
                    </p>

                    {/* Tech pills */}
                    <div className="flex flex-wrap gap-2 mb-9 hero-entry hero-entry-d3">
                        {pills.map(p => <HeroPill key={p} label={p} />)}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 flex-wrap hero-entry hero-entry-d4">
                        <BtnPrimary href="#">▶ Live Demo</BtnPrimary>
                        <BtnSecondary href="https://github.com" target="_blank">⌥ View Code</BtnSecondary>
                    </div>
                </div>

                {/* ── Right Mockup ── */}
                <div className="relative hide-mobile">
                    {/* Glow behind mockup */}
                    <div className="absolute pointer-events-none"
                        style={{ inset: -40, background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(124,111,205,0.12) 0%, transparent 70%)' }} />

                    {/* Floating badges */}
                    <FloatingBadge icon="🟢" label="3 users online" className="top-[-16px] right-5" delayClass="anim-float" />
                    <FloatingBadge icon="✅" label="Message seen" className="bottom-[60px] left-[-20px]" delayClass="anim-float-d1" />
                    <FloatingBadge icon="📎" label="File shared" className="bottom-[-16px] right-10" delayClass="anim-float-d2" />

                    {/* Mockup Window */}
                    <div
                        className="relative w-full max-w-[520px] rounded-[18px] overflow-hidden text-[13px]"
                        style={{
                            background: 'var(--surface-panel)', border: '1px solid var(--surface-border)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,111,205,0.1)'
                        }}
                    >
                        {/* Window topbar */}
                        <div className="flex items-center justify-between px-4 py-[14px]"
                            style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}>
                            <div className="flex gap-[6px]">
                                <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#FF5F57' }} />
                                <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#FEBC2E' }} />
                                <span className="w-[10px] h-[10px] rounded-full" style={{ background: '#28C840' }} />
                            </div>
                            <span className="font-mono text-[11px]" style={{ color: 'var(--chat-faint)' }}>talkstream.app</span>
                            <div className="w-[54px]" />
                        </div>

                        {/* Chat body */}
                        <div className="flex h-[380px]">

                            {/* Sidebar */}
                            <div className="w-[180px] flex-shrink-0 py-[10px]"
                                style={{ borderRight: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}>
                                {/* Search */}
                                <div className="mx-[10px] mb-[10px] rounded-lg px-[10px] py-[6px] flex items-center gap-[6px] text-[11px]"
                                    style={{ background: 'var(--surface-raised)', color: 'var(--chat-faint)' }}>
                                    🔍 Search...
                                </div>
                                {convos.map(c => <ConvoItem key={c.name} {...c} />)}
                            </div>

                            {/* Chat room */}
                            <div className="flex-1 flex flex-col" style={{ background: 'var(--surface-base)' }}>
                                {/* Header */}
                                <div className="flex items-center gap-[10px] px-4 py-3"
                                    style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}>
                                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold"
                                        style={{ background: '#7C6FCD22', color: '#7C6FCD' }}>AR</div>
                                    <div className="flex-1">
                                        <div className="text-[13px] font-semibold" style={{ color: 'var(--chat-primary)' }}>Arav R.</div>
                                        <div className="text-[10.5px]" style={{ color: 'var(--status-online)' }}>● Online</div>
                                    </div>
                                    <div className="text-[14px]" style={{ color: 'var(--chat-faint)' }}>⋯</div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-hidden px-3 py-[14px] flex flex-col gap-2">
                                    <Msg from="them" time="10:42 AM">Hey! Can you check the latest design?</Msg>
                                    <Msg from="me" time="10:44 AM" showImg>Here's the updated UI file</Msg>
                                    <Msg from="them" time="10:45 AM">Looks great! Loving the dark theme 🔥</Msg>
                                    <Msg from="me" time="10:46 AM">Shipped it this morning 🚀</Msg>
                                    {/* Typing indicator */}
                                    <div className="flex items-center gap-[6px] px-3 py-2 rounded-xl self-start"
                                        style={{ background: 'var(--surface-raised)', borderRadius: '12px 12px 12px 4px' }}>
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className={`block w-[6px] h-[6px] rounded-full animate-typing-bounce-${i}`}
                                                style={{ background: 'var(--chat-faint)' }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Input bar */}
                                <div className="flex items-center gap-2 px-3 py-[10px]"
                                    style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] cursor-pointer">😊</div>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] cursor-pointer">📎</div>
                                    <div className="flex-1 rounded-[10px] px-3 py-[7px] text-[11.5px]"
                                        style={{ background: 'var(--surface-raised)', color: 'var(--chat-muted)' }}>
                                        Type a message...
                                    </div>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] cursor-pointer"
                                        style={{ background: 'var(--brand)', boxShadow: '0 0 12px var(--brand-glow)' }}>
                                        ➤
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
