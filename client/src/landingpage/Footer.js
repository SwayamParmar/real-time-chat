import React from 'react';

const footerLinks = [
    { label: '⌥ GitHub', href: 'https://github.com', target: '_blank' },
    { label: 'in LinkedIn', href: 'https://linkedin.com', target: '_blank' },
    { label: '✉ Contact', href: 'mailto:you@email.com', target: undefined },
];

const FooterLink = ({ label, href, target }) => (
    <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        className="inline-flex items-center gap-[6px] text-[13px] font-medium px-[14px] py-[7px] rounded-lg no-underline transition-all duration-200"
        style={{ color: 'var(--chat-muted)', border: '1px solid var(--surface-border)', background: 'transparent' }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--surface-muted)';
            e.currentTarget.style.color = 'var(--chat-primary)';
            e.currentTarget.style.background = 'var(--surface-raised)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.color = 'var(--chat-muted)';
            e.currentTarget.style.background = 'transparent';
        }}
    >
        {label}
    </a>
);

const Footer = () => (
    <footer style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-panel)', padding: '40px 24px 0' }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-5 pb-10">
            {/* Left */}
            <div>
                <div className="font-syne font-bold text-[18px]" style={{ color: 'var(--chat-primary)' }}>
                    Talk<span style={{ color: 'var(--brand)' }}>Stream</span>
                </div>
                <div className="font-mono text-[12px] mt-[6px]" style={{ color: 'var(--chat-faint)' }}>
                    real-time · full-stack · production-grade
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-2 flex-wrap">
                {footerLinks.map(l => <FooterLink key={l.label} {...l} />)}
            </div>
        </div>

        {/* Copyright bar */}
        <div
            className="max-w-[1200px] mx-auto text-center font-mono text-[12px] py-5"
            style={{ borderTop: '1px solid var(--surface-border)', color: 'var(--chat-ghost)' }}
        >
            Built with Node.js · React · Socket.io · MongoDB · Tailwind CSS — by a full-stack engineer who ships.
        </div>
    </footer>
);

export default Footer;
