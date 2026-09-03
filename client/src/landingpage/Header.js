import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import TalkStreamLogo from '../components/TalkStreamLogo';

const NAV_ITEMS = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how' },
    { label: 'Tech Stack', href: '#tech' },
    { label: 'Modules', href: '#modules' },
    { label: 'FAQ', href: '#faq' },
];

const GITHUB_URL = 'https://github.com/SwayamParmar/real-time-chat';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const scrolledRef = useRef(false);

    // Passive listener, and state is only written when the boolean flips, so
    // scrolling does not re-render the header on every frame.
    useEffect(() => {
        const handleScroll = () => {
            const next = window.scrollY > 40;
            if (next === scrolledRef.current) return;
            scrolledRef.current = next;
            setScrolled(next);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll while the mobile sheet is open.
    useEffect(() => {
        if (!menuOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [menuOpen]);

    // Close the mobile sheet on Escape.
    useEffect(() => {
        if (!menuOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    const handleNavClick = useCallback((e, id) => {
        e.preventDefault();
        setMenuOpen(false);
        const target = document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] h-16 flex items-center
                    px-5 sm:px-6 border-b backdrop-blur-xl transition-colors duration-300`}
                style={{
                    background: 'rgba(11,13,20,0.72)',
                    borderColor: scrolled ? 'rgba(31,35,51,0.95)' : 'rgba(31,35,51,0.5)',
                }}
            >
                <div className="container-ts flex items-center justify-between gap-4">
                    <TalkStreamLogo variant="text" />

                    {/* ── Desktop nav ── */}
                    <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0">
                        {NAV_ITEMS.map(({ label, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    onClick={(e) => handleNavClick(e, href)}
                                    className="nav-link"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* ── Desktop actions ── */}
                    <div className="hidden sm:flex items-center gap-2">
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="nav-link !flex items-center gap-2"
                            aria-label="View source on GitHub"
                        >
                            <FiGithub size={15} aria-hidden="true" />
                            <span className="hidden md:inline">GitHub</span>
                        </a>

                        <Link to="/login" className="nav-link">
                            Sign in
                        </Link>

                        <Link to="/register" className="btn btn-primary btn-sm">
                            Get Started
                            <FiArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </div>

                    {/* ── Mobile trigger ── */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        className="sm:hidden w-10 h-10 -mr-2 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--chat-secondary)' }}
                    >
                        {menuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
                    </button>
                </div>
            </nav>

            {/* ── Mobile sheet ──
                Previously every nav item (including the only call to action)
                was hidden below 600px, leaving phones with no navigation. */}
            {menuOpen && (
                <div
                    className="sm:hidden fixed inset-x-0 bottom-0 z-[99] overflow-y-auto px-5 pt-6 pb-10"
                    style={{
                        top: 'var(--header-h)',
                        background: 'rgba(11,13,20,0.98)',
                        backdropFilter: 'blur(16px)',
                    }}
                >
                    <ul className="list-none m-0 p-0 flex flex-col gap-1">
                        {NAV_ITEMS.map(({ label, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    onClick={(e) => handleNavClick(e, href)}
                                    className="block px-4 py-3 rounded-xl text-[15px] font-medium no-underline"
                                    style={{ color: 'var(--chat-secondary)' }}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] font-medium no-underline"
                                style={{ color: 'var(--chat-secondary)' }}
                            >
                                <FiGithub size={16} aria-hidden="true" />
                                GitHub
                            </a>
                        </li>
                    </ul>

                    <div className="hairline my-5" />

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="btn btn-primary w-full"
                        >
                            Create free account
                            <FiArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="btn btn-secondary w-full"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
