import React from 'react';
import { FiKey, FiHash, FiCheckSquare, FiGlobe, FiFilter, FiTerminal } from 'react-icons/fi';
import useReveal from './useReveal';

/* See the Security section of the repository README. */
const MEASURES = [
    {
        Icon: FiKey,
        title: 'Token-guarded everywhere',
        desc: 'The same signed JWT authorises REST routes and the socket handshake. Expired and malformed tokens are answered differently, so clients can react correctly.',
    },
    {
        Icon: FiHash,
        title: 'Hashed credentials',
        desc: 'Passwords are hashed with bcrypt in a pre-save hook on the User model. A plaintext password never reaches the database.',
    },
    {
        Icon: FiCheckSquare,
        title: 'Validated input',
        desc: 'Auth routes run express-validator chains behind shared validation middleware, so malformed payloads are rejected before any handler runs.',
    },
    {
        Icon: FiTerminal,
        title: 'Fail-fast configuration',
        desc: 'A Zod schema parses every environment variable at boot. A missing or malformed secret stops the process instead of surfacing later as a runtime error.',
    },
    {
        Icon: FiGlobe,
        title: 'Locked-down CORS',
        desc: 'Both Express and Socket.IO only accept the configured client origin, and room joins re-check that the user is actually a participant.',
    },
    {
        Icon: FiFilter,
        title: 'Constrained uploads',
        desc: 'Attachments are capped at 20 MB and screened against a MIME allowlist before they are streamed to Cloudinary.',
    },
];

const MeasureCard = ({ Icon, title, desc, delayClass }) => {
    const reveal = useReveal();

    return (
        <div ref={reveal} className={`reveal card card-lift ${delayClass} p-6`}>
            <span className="icon-chip w-10 h-10 mb-4">
                <Icon size={18} aria-hidden="true" />
            </span>
            <h3 className="font-display font-bold text-[14.5px] mb-2" style={{ color: 'var(--chat-primary)' }}>
                {title}
            </h3>
            <p className="text-[13px] leading-[1.65] m-0" style={{ color: 'var(--chat-faint)' }}>
                {desc}
            </p>
        </div>
    );
};

const DELAYS = ['', 'reveal-d1', 'reveal-d2', '', 'reveal-d1', 'reveal-d2'];

const SecuritySection = () => (
    <section id="security" className="section" style={{ background: 'var(--surface-base)' }}>
        <div className="container-ts">
            <header className="section-head">
                <span className="eyebrow">Security</span>
                <h2 className="section-title">
                    Private conversations,
                    <br className="hidden sm:block" /> guarded at every layer.
                </h2>
                <p className="section-sub">
                    Real-time systems fail open when auth is bolted on afterwards. Here the token,
                    the validation and the origin checks sit on both transports from the start.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {MEASURES.map((m, i) => (
                    <MeasureCard key={m.title} {...m} delayClass={DELAYS[i]} />
                ))}
            </div>
        </div>
    </section>
);

export default SecuritySection;
