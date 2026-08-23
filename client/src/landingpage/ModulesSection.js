import React from 'react';
import useReveal from './useReveal';

const MODULES = [
    { num: '01', title: 'Core Architecture', tags: ['Express', 'TypeScript', 'MongoDB', 'Socket.IO'] },
    { num: '02', title: 'JWT Authentication', tags: ['Login', 'Signup', 'Socket Identity'] },
    { num: '03', title: 'Conversation System', tags: ['User Search', 'Recency Sort', 'Last Message'] },
    { num: '04', title: 'Real-Time Engine', tags: ['sendMessage', 'receiveMessage', 'Rooms'] },
    { num: '05', title: 'Message Status', tags: ['Sent', 'Delivered', 'Seen'] },
    { num: '06', title: 'Online Presence', tags: ['Live Status', 'Connect/Disconnect'] },
    { num: '07', title: 'Typing Indicator', tags: ['Debounced', 'Start/Stop Events'] },
    { num: '08', title: 'Unread System', tags: ['Per-Conversation', 'Auto Reset'] },
    { num: '09', title: 'Message Actions', tags: ['Edit', 'Delete', 'Context Menu'] },
    { num: '10', title: 'Attachments', tags: ['Cloudinary', 'Multer', 'MIME Allowlist'] },
    { num: '11', title: 'Paginated History', tags: ['Infinite Scroll', 'Lazy Load'] },
    { num: '12', title: 'UI / UX System', tags: ['Dark Theme', 'Tailwind', 'Responsive'] },
];

const ModuleRow = ({ num, title, tags }) => {
    const reveal = useReveal();

    return (
        <div
            ref={reveal}
            className="reveal card card-lift flex items-start gap-4 px-5 sm:px-[22px] py-5"
            style={{ background: 'var(--surface-base)' }}
        >
            <span className="pill pill-brand font-medium flex-shrink-0 mt-[2px]">{num}</span>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[14.5px] mb-2" style={{ color: 'var(--chat-primary)' }}>
                    {title}
                </h3>
                <div className="flex flex-wrap gap-[5px]">
                    {tags.map((tag) => (
                        <span key={tag} className="pill text-[10.5px] py-[2px] px-2">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ModulesSection = () => (
    <section id="modules" className="section" style={{ background: 'var(--surface-panel)' }}>
        <div className="container-ts">
            <header className="section-head">
                <span className="eyebrow">Engineering Depth</span>
                <h2 className="section-title">
                    12 production modules.
                    <br className="hidden sm:block" /> Built from scratch.
                </h2>
                <p className="section-sub">
                    Each module is independently implemented and integrated — routes, controllers,
                    services, socket handlers and UI, all the way down.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map((m) => (
                    <ModuleRow key={m.num} {...m} />
                ))}
            </div>
        </div>
    </section>
);

export default ModulesSection;
