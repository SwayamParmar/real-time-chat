import React from 'react';
import { FiLock, FiLink2, FiUpload, FiDownload } from 'react-icons/fi';
import useReveal from './useReveal';

const Code = ({ children }) => <code className="code-inline">{children}</code>;

/* Event names mirror server/src/socket/socket.ts exactly. */
const STEPS = [
    {
        Icon: FiLock,
        title: 'Authenticate',
        desc: 'Credentials are exchanged for a signed JWT. The same token is passed through the socket handshake, so the connection carries a verified identity.',
    },
    {
        Icon: FiLink2,
        title: 'Connect & Join',
        desc: (
            <>
                Socket.IO opens a persistent connection. The user lands in a personal{' '}
                <Code>user:&lt;id&gt;</Code> room, and <Code>joinConversation</Code> adds them to a
                thread after a participant check.
            </>
        ),
    },
    {
        Icon: FiUpload,
        title: 'Emit',
        desc: (
            <>
                The client fires <Code>sendMessage</Code>. The server validates it, persists it to
                MongoDB, and broadcasts to the conversation room.
            </>
        ),
    },
    {
        Icon: FiDownload,
        title: 'Receive & Confirm',
        desc: (
            <>
                Participants get <Code>receiveMessage</Code> and render immediately.{' '}
                <Code>messagesDelivered</Code> and <Code>messagesSeen</Code> travel back to update
                the sender&apos;s receipts.
            </>
        ),
    },
];

const StepCard = ({ Icon, title, desc, index, delayClass }) => {
    const reveal = useReveal();

    return (
        <div ref={reveal} className={`step reveal ${delayClass} relative px-2 sm:px-5 text-center`}>
            {/* Icon + step number */}
            <div className="relative inline-flex mb-5">
                <span
                    className="icon-chip w-14 h-14 rounded-full"
                    style={{ background: 'var(--surface-base)' }}
                >
                    <Icon size={21} aria-hidden="true" />
                </span>
                <span
                    className="absolute -top-1 -right-1 w-[19px] h-[19px] rounded-full font-mono
                        text-[10px] font-medium flex items-center justify-center"
                    style={{
                        background: 'var(--brand)',
                        color: '#fff',
                        border: '2px solid var(--surface-panel)',
                    }}
                >
                    {index + 1}
                </span>
            </div>

            <h3 className="font-display font-bold text-[15px] mb-2" style={{ color: 'var(--chat-primary)' }}>
                {title}
            </h3>
            <p className="text-[13px] leading-[1.7] m-0" style={{ color: 'var(--chat-faint)' }}>
                {desc}
            </p>
        </div>
    );
};

const DELAYS = ['', 'reveal-d1', 'reveal-d2', 'reveal-d3'];

const HowItWorksSection = () => (
    <section id="how" className="section" style={{ background: 'var(--surface-panel)' }}>
        <div className="container-ts">
            <header className="section-head">
                <span className="eyebrow">Architecture</span>
                <h2 className="section-title">
                    How a message travels
                    <br className="hidden sm:block" /> from you to them.
                </h2>
                <p className="section-sub">
                    Four hops from keypress to delivered — here is what the real-time engine does
                    on every single message.
                </p>
            </header>

            <div className="relative">
                {/* Connector rail — only meaningful when the steps sit in one row */}
                <div
                    className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-px"
                    aria-hidden="true"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, var(--brand-subtle), var(--brand-subtle), transparent)',
                    }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-0">
                    {STEPS.map((s, i) => (
                        <StepCard key={s.title} {...s} index={i} delayClass={DELAYS[i]} />
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorksSection;
