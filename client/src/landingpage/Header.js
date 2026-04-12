import React, { useEffect, useRef, useState } from 'react';
import TalkStreamLogo from '../components/TalkStreamLogo';

const Header = () => {
    const navRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-[100] px-6 h-16 flex items-center
                border-b backdrop-blur-xl transition-colors duration-300
                bg-[rgba(13,15,22,0.72)]
                ${scrolled ? 'border-[rgba(30,33,48,0.9)]' : 'border-[rgba(30,33,48,0.6)]'}`}
        >
            <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
                <TalkStreamLogo variant='text' />

                {/* Nav Links */}
                <ul className="flex items-center gap-[6px] list-none hide-sm">
                    {[
                        { label: 'Features', href: '#features' },
                        { label: 'How It Works', href: '#how' },
                        { label: 'Tech Stack', href: '#tech' },
                        { label: 'Modules', href: '#modules' },
                    ].map(({ label, href }) => (
                        <li key={label}>
                            <a
                                href={href}
                                onClick={(e) => handleNavClick(e, href)}
                                className="text-[14px] font-medium px-[14px] py-[6px] rounded-lg transition-all duration-200 no-underline"
                                style={{ color: 'var(--chat-muted)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = 'var(--chat-primary)';
                                    e.currentTarget.style.background = 'var(--surface-raised)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'var(--chat-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    ))}

                    {/* GitHub */}
                    <li>
                        <a
                            href="https://github.com/SwayamParmar/real-time-chat"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[14px] font-medium px-[14px] py-[6px] rounded-lg transition-all duration-200 no-underline"
                            style={{ color: 'var(--chat-muted)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'var(--chat-primary)';
                                e.currentTarget.style.background = 'var(--surface-raised)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--chat-muted)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            GitHub{' '}
                            <span
                                className="font-mono text-[9px] font-medium px-[5px] py-[1px] rounded-[4px] ml-1 align-middle tracking-[0.05em]"
                                style={{
                                    background: 'var(--brand-glow)',
                                    border: '1px solid var(--brand-subtle)',
                                    color: 'var(--brand)',
                                }}
                            >
                                src
                            </span>
                        </a>
                    </li>

                    {/* CTA */}
                    <li>
                        <a
                            href="/register"
                            className="text-[13.5px] font-semibold px-[18px] py-[7px] rounded-[9px] text-white no-underline transition-all duration-200"
                            style={{
                                background: 'var(--brand)',
                                boxShadow: '0 0 20px var(--brand-glow)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--brand-dark)';
                                e.currentTarget.style.boxShadow = '0 0 30px var(--brand-subtle)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--brand)';
                                e.currentTarget.style.boxShadow = '0 0 20px var(--brand-glow)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            Open App →
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Header;
