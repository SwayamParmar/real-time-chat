import React from 'react';
import {
    FiZap,
    FiEdit3,
    FiWifi,
    FiPaperclip,
    FiEye,
    FiBell,
    FiRefreshCw,
    FiTrash2,
    FiShield,
} from 'react-icons/fi';
import useReveal from './useReveal';

const Code = ({ children }) => <code className="code-inline">{children}</code>;

const FEATURES = [
    {
        Icon: FiZap,
        title: 'Real-Time Messaging',
        desc: (
            <>
                Bi-directional Socket.IO transport. Messages are persisted and broadcast to both
                participants in the same round trip — <Code>sendMessage</Code> in,{' '}
                <Code>receiveMessage</Code> out.
            </>
        ),
    },
    {
        Icon: FiEdit3,
        title: 'Typing Indicators',
        desc: 'A live "user is typing" state driven by debounced socket events, suppressed automatically after a short inactivity window.',
    },
    {
        Icon: FiWifi,
        title: 'Online Presence',
        desc: 'Per-user online and offline status tracked through socket connect and disconnect events, propagated instantly to everyone in the conversation.',
    },
    {
        Icon: FiPaperclip,
        title: 'Files & Media',
        desc: 'Images, video and documents up to 20 MB, uploaded to Cloudinary behind a MIME allowlist, with optimistic previews while the transfer completes.',
    },
    {
        Icon: FiEye,
        title: 'Read Receipts',
        desc: 'Three-stage message state — sent, delivered, seen — persisted on the message document and updated over the socket rather than by polling.',
    },
    {
        Icon: FiBell,
        title: 'Unread Counters',
        desc: 'Per-conversation unread badges that increment as messages arrive and reset the moment the thread is opened.',
    },
    {
        Icon: FiRefreshCw,
        title: 'Infinite History',
        desc: 'Paginated message loading — a first page on open, older pages fetched as you scroll back, so opening a long thread stays fast.',
    },
    {
        Icon: FiTrash2,
        title: 'Edit & Delete',
        desc: 'Context-menu message actions. Edits and deletions are reflected live for every participant in the conversation.',
    },
    {
        Icon: FiShield,
        title: 'JWT Authentication',
        desc: 'The same signed token guards the REST API and the socket handshake, so identity carries across both transports with participant checks on every room join.',
    },
];

const FeatureCard = ({ Icon, title, desc }) => (
    <div className="tile p-7 sm:p-8">
        <div className="relative">
            <span className="icon-chip w-11 h-11 mb-4">
                <Icon size={20} aria-hidden="true" />
            </span>

            <h3 className="font-display font-bold text-[15.5px] mb-2" style={{ color: 'var(--chat-primary)' }}>
                {title}
            </h3>

            <p className="text-[13.5px] leading-[1.65] m-0" style={{ color: 'var(--chat-faint)' }}>
                {desc}
            </p>
        </div>
    </div>
);

const FeaturesSection = () => {
    const reveal = useReveal();

    return (
        <section id="features" className="section" style={{ background: 'var(--surface-base)' }}>
            <div className="container-ts">
                <header className="section-head">
                    <span className="eyebrow">Features</span>
                    <h2 className="section-title">
                        Everything a modern
                        <br className="hidden sm:block" /> chat platform needs.
                    </h2>
                    <p className="section-sub">
                        Every capability here is implemented in this repository — no third-party chat SDK
                        is doing the work behind the scenes.
                    </p>
                </header>

                <div
                    ref={reveal}
                    className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden"
                    style={{ background: 'var(--surface-border)', border: '1px solid var(--surface-border)' }}
                >
                    {FEATURES.map((f) => (
                        <FeatureCard key={f.title} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
