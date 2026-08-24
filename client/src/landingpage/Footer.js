import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import TalkStreamLogo from '../components/TalkStreamLogo';

const GITHUB_URL = 'https://github.com/SwayamParmar/real-time-chat';

// TODO: replace the LinkedIn and email placeholders with your own before
// deploying — they are intentionally left generic rather than guessed.
const SOCIAL = [
    { Icon: FiGithub, label: 'GitHub', href: GITHUB_URL, external: true },
    { Icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/swayam-parmar-988a45214', external: true },
    { Icon: FiMail, label: 'Email', href: 'mailto:swayam.parmar@example.com', external: false },
];

/* Column links: in-page anchors keep the smooth-scroll behaviour, while
   route links go through the router so they never trigger a full reload. */
const COLUMNS = [
    {
        title: 'Product',
        links: [
            { label: 'Features', to: '#features' },
            { label: 'How It Works', to: '#how' },
            { label: 'Security', to: '#security' },
            { label: 'FAQ', to: '#faq' },
        ],
    },
    {
        title: 'Engineering',
        links: [
            { label: 'Tech Stack', to: '#tech' },
            { label: 'Modules', to: '#modules' },
            { label: 'Source Code', href: GITHUB_URL },
            { label: 'Report an Issue', href: `${GITHUB_URL}/issues` },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Sign In', route: '/login' },
            { label: 'Create Account', route: '/register' },
        ],
    },
];

const ColumnLink = ({ label, to, href, route }) => {
    const className = 'link-muted text-[13.5px] no-underline';

    if (route) {
        return (
            <Link to={route} className={className}>
                {label}
            </Link>
        );
    }

    return (
        <a
            href={href || to}
            className={className}
            target={href ? '_blank' : undefined}
            rel={href ? 'noreferrer' : undefined}
        >
            {label}
        </a>
    );
};

const Footer = () => (
    <footer
        className="px-5 sm:px-6 pt-14"
        style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-panel)' }}
    >
        <div className="container-ts grid grid-cols-2 md:grid-cols-[1.6fr_repeat(3,1fr)] gap-x-6 gap-y-10 pb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
                <TalkStreamLogo variant="text" textSize="text-[18px]" />
                <p className="text-[13.5px] leading-[1.7] mt-4 max-w-[280px]" style={{ color: 'var(--chat-faint)' }}>
                    An open-source, real-time messaging platform — built end to end with Socket.IO,
                    a TypeScript API and MongoDB.
                </p>

                <div className="flex gap-2 mt-5">
                    {SOCIAL.map(({ Icon, label, href, external }) => (
                        <a
                            key={label}
                            href={href}
                            aria-label={label}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noreferrer' : undefined}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
                            style={{
                                border: '1px solid var(--surface-border)',
                                color: 'var(--chat-muted)',
                            }}
                        >
                            <Icon size={16} aria-hidden="true" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Link columns */}
            {COLUMNS.map((col) => (
                <div key={col.title}>
                    <div
                        className="font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
                        style={{ color: 'var(--chat-muted)' }}
                    >
                        {col.title}
                    </div>
                    <nav className="flex flex-col gap-[10px]">
                        {col.links.map((l) => (
                            <ColumnLink key={l.label} {...l} />
                        ))}
                    </nav>
                </div>
            ))}
        </div>

        {/* Bottom bar */}
        <div
            className="container-ts flex flex-col sm:flex-row items-center justify-between gap-3 py-6"
            style={{ borderTop: '1px solid var(--surface-border)' }}
        >
            <span className="font-mono text-[12px]" style={{ color: 'var(--chat-ghost)' }}>
                © {new Date().getFullYear()} TalkStream. Open-source.
            </span>
            <span className="font-mono text-[12px] text-center sm:text-right" style={{ color: 'var(--chat-ghost)' }}>
                React · Socket.IO · Node · MongoDB · Tailwind
            </span>
        </div>
    </footer>
);

export default Footer;
