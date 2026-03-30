import React, { useEffect, useRef } from 'react';

const modules = [
    { num: '01', title: 'Core Architecture', tags: ['Node.js', 'Express', 'MongoDB', 'Socket.io'] },
    { num: '02', title: 'JWT Authentication', tags: ['Login', 'Register', 'Socket Identity'] },
    { num: '03', title: 'Conversation System', tags: ['User Search', 'Recent Sort', 'Message Preview'] },
    { num: '04', title: 'Real-Time Engine', tags: ['message_send', 'message_receive', 'Bi-directional'] },
    { num: '05', title: 'Message Status System', tags: ['Sent', 'Delivered', 'Seen'] },
    { num: '06', title: 'Online Presence', tags: ['Live Status', 'Last Seen', 'Socket Events'] },
    { num: '07', title: 'Typing Indicator', tags: ['Debounced', 'Start/Stop Events'] },
    { num: '08', title: 'Unread Message System', tags: ['Per-Conversation', 'Dynamic Count', 'Auto Reset'] },
    { num: '09', title: 'Message Actions', tags: ['Edit', 'Delete', 'Context Menu'] },
    { num: '10', title: 'File & Attachment System', tags: ['Drag & Drop', 'Image Upload', 'Preview', 'Non-blocking'] },
    { num: '11', title: 'Infinite Scroll Pagination', tags: ['20 Initial Messages', 'Lazy Load'] },
    { num: '12', title: 'UI / UX System', tags: ['Dark Theme', 'Tailwind CSS', 'Responsive', 'Animations'] },
];

const ModuleRow = ({ num, title, tags, rowRef }) => (
    <div
        ref={rowRef}
        className="reveal flex items-start gap-4 rounded-[14px] px-[22px] py-5 transition-all duration-250"
        style={{ background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--surface-muted)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
    >
        {/* Number badge */}
        <span
            className="font-mono text-[11px] font-medium px-[7px] py-[2px] rounded-[6px] flex-shrink-0 mt-[2px]"
            style={{ color: 'var(--brand)', background: 'var(--brand-glow)', border: '1px solid var(--brand-subtle)' }}
        >
            {num}
        </span>

        {/* Content */}
        <div className="flex-1">
            <div className="font-bold text-[14px] mb-2" style={{ color: 'var(--chat-primary)' }}>{title}</div>
            <div className="flex flex-wrap gap-[5px]">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="font-mono text-[10.5px] px-2 py-[2px] rounded-[5px]"
                        style={{ color: 'var(--chat-faint)', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const ModulesSection = () => {
    const rowRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.08 }
        );
        rowRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section id="modules" className="py-[100px] px-6" style={{ background: 'var(--surface-panel)' }}>
            <div className="max-w-[1200px] mx-auto">
                {/* Label */}
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
                    style={{ color: 'var(--brand)' }}>
                    <span className="inline-block w-[18px] h-px" style={{ background: 'var(--brand)' }} />
                    Engineering Depth
                </div>

                <h2 className="font-syne font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
                    style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--chat-primary)' }}>
                    12 production modules.<br />Built from scratch.
                </h2>

                <p className="text-[16px] leading-[1.7] mb-[60px]"
                    style={{ color: 'var(--chat-muted)', maxWidth: 520 }}>
                    Every module independently engineered, tested, and integrated — showcasing full-stack depth
                    across the entire application.
                </p>

                {/* 2-col module grid */}
                <div className="grid grid-cols-2 gap-3">
                    {modules.map((m, i) => (
                        <ModuleRow
                            key={m.num}
                            {...m}
                            rowRef={el => (rowRefs.current[i] = el)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModulesSection;
