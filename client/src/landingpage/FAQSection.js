import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import useReveal from './useReveal';

/* Built on native <details>/<summary>, so open/close state and keyboard
   support come from the browser. */
const FAQS = [
    {
        q: 'Is TalkStream free to use?',
        a: 'Yes. Creating an account and messaging are free, and the entire source is public — you can read exactly how every feature works, or run your own instance.',
    },
    {
        q: 'How fast is "real-time" here?',
        a: 'Messages travel over a persistent WebSocket connection rather than polling, so delivery is typically well under 50 ms on a normal connection. Typing indicators, presence and read receipts use the same channel.',
    },
    {
        q: 'What can I send besides text?',
        a: 'Images, video and documents up to 20 MB per file. Uploads are screened against a MIME allowlist, stored on Cloudinary, and previewed inline in the thread while the transfer finishes.',
    },
    {
        q: 'Can I edit or delete a message after sending?',
        a: 'Yes. Both actions are available from the message context menu, and the change is pushed to everyone in the conversation immediately — no refresh needed.',
    },
    {
        q: 'What happens to messages sent while I am offline?',
        a: 'They are persisted in MongoDB as they arrive. When you reconnect, your conversation list shows unread counts, and the full history loads page by page as you scroll back.',
    },
    {
        q: 'Do you support group chats or calls?',
        a: 'Not yet. TalkStream currently focuses on one-to-one conversations. Group threads and calls are natural extensions of the existing room model, but they are not implemented today.',
    },
    {
        q: 'Can I self-host it?',
        a: 'Yes. You need Node, a MongoDB instance and a Cloudinary account. The README walks through environment variables, local development and the production build for both the client and the server.',
    },
];

const FaqItem = ({ q, a }) => (
    <details className="faq-item card px-5 sm:px-6">
        <summary className="flex items-center justify-between gap-4 py-5 list-none">
            <h3 className="text-[14.5px] sm:text-[15px] font-semibold m-0" style={{ color: 'var(--chat-primary)' }}>
                {q}
            </h3>
            <FiChevronDown
                size={18}
                className="faq-chevron flex-shrink-0"
                style={{ color: 'var(--brand)' }}
                aria-hidden="true"
            />
        </summary>
        <p
            className="text-[13.5px] leading-[1.7] m-0 pb-5 pr-6"
            style={{ color: 'var(--chat-faint)' }}
        >
            {a}
        </p>
    </details>
);

const FAQSection = () => {
    const reveal = useReveal();

    return (
        <section id="faq" className="section" style={{ background: 'var(--surface-panel)' }}>
            <div className="container-ts">
                <header className="section-head">
                    <span className="eyebrow">FAQ</span>
                    <h2 className="section-title">Questions, answered.</h2>
                    <p className="section-sub">
                        What TalkStream does today, what it does not do yet, and how to run it yourself.
                    </p>
                </header>

                <div ref={reveal} className="reveal flex flex-col gap-3 max-w-[820px]">
                    {FAQS.map((f) => (
                        <FaqItem key={f.q} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
