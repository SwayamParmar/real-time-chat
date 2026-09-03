import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiEye, FiPaperclip, FiShield, FiArrowLeft } from 'react-icons/fi';
import TalkStreamLogo from './TalkStreamLogo';

// Shares the landing page's tokens and .font-display / .btn helpers.
import '../landingpage/landing.css';

/* ─────────────────────────────────────────────────────────────
   Shared chrome for the Login and Signup pages.
───────────────────────────────────────────────────────────── */

const HIGHLIGHTS = [
    { Icon: FiZap, title: 'Instant delivery', desc: 'Messages travel over a persistent socket — no refresh, no polling.' },
    { Icon: FiEye, title: 'Read receipts', desc: 'See when a message is delivered and when it has actually been read.' },
    { Icon: FiPaperclip, title: 'Share anything', desc: 'Images, video and documents up to 20 MB, previewed inline.' },
    { Icon: FiShield, title: 'Secured by default', desc: 'Hashed credentials and token-guarded REST and socket access.' },
];

const AuthShell = ({ title, subtitle, footer, children }) => (
    <div className="landing-root min-h-screen grid lg:grid-cols-2">

        {/* ── Brand panel — desktop only ── */}
        <aside
            className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 xl:p-14"
            style={{ background: 'var(--surface-panel)', borderRight: '1px solid var(--surface-border)' }}
        >
            <div className="grid-bg" aria-hidden="true" />
            <div
                className="orb"
                aria-hidden="true"
                style={{
                    width: 560,
                    height: 560,
                    left: -160,
                    bottom: -180,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 65%)',
                }}
            />

            <div className="relative z-[1]">
                <TalkStreamLogo variant="text" />
            </div>

            <div className="relative z-[1] max-w-[420px]">
                <h2
                    className="font-display font-extrabold tracking-[-0.03em] leading-[1.12] mb-8"
                    style={{ fontSize: 'clamp(28px, 2.6vw, 36px)', color: 'var(--chat-primary)' }}
                >
                    Conversations that keep up with you.
                </h2>

                <ul className="list-none m-0 p-0 flex flex-col gap-5">
                    {HIGHLIGHTS.map(({ Icon, title: t, desc }) => (
                        <li key={t} className="flex items-start gap-3.5">
                            <span className="icon-chip w-9 h-9 flex-shrink-0 mt-[2px]">
                                <Icon size={16} aria-hidden="true" />
                            </span>
                            <div>
                                <div className="text-[14px] font-semibold" style={{ color: 'var(--chat-primary)' }}>
                                    {t}
                                </div>
                                <div className="text-[13px] leading-[1.6]" style={{ color: 'var(--chat-faint)' }}>
                                    {desc}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative z-[1] font-mono text-[12px]" style={{ color: 'var(--chat-ghost)' }}>
                Open-source · React · Socket.IO · Node · MongoDB
            </div>
        </aside>

        {/* ── Form panel ── */}
        <main
            className="flex flex-col items-center justify-center px-5 sm:px-8 py-10 sm:py-12 relative"
            style={{ background: 'var(--surface-base)' }}
        >
            {/* Back to landing page */}
            <Link
                to="/"
                className="link-muted absolute top-6 left-5 sm:left-8 inline-flex items-center gap-1.5 text-[13px] font-medium"
            >
                <FiArrowLeft size={15} aria-hidden="true" />
                Back
            </Link>

            <div className="w-full max-w-[400px]">

                {/* Compact logo — the brand panel covers this on desktop */}
                <div className="lg:hidden flex justify-center mb-8">
                    <TalkStreamLogo variant="text" />
                </div>

                <header className="mb-7 text-center lg:text-left">
                    <h1
                        className="font-display font-extrabold tracking-[-0.02em] mb-2"
                        style={{ fontSize: 'clamp(24px, 3vw, 30px)', color: 'var(--chat-primary)' }}
                    >
                        {title}
                    </h1>
                    <p className="text-[14.5px] m-0" style={{ color: 'var(--chat-muted)' }}>
                        {subtitle}
                    </p>
                </header>

                {children}

                {footer && (
                    <p className="mt-7 text-center text-[14px]" style={{ color: 'var(--chat-muted)' }}>
                        {footer}
                    </p>
                )}
            </div>
        </main>
    </div>
);

export default AuthShell;
