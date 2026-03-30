import React, { useEffect, useRef } from 'react';

const techStack = [
    { logo: '⚛️', name: 'React', role: 'UI Framework' },
    { logo: '🟢', name: 'Node.js', role: 'Runtime' },
    { logo: '🔌', name: 'Socket.io', role: 'Real-Time Layer' },
    { logo: '🍃', name: 'MongoDB', role: 'Database' },
    { logo: '🎨', name: 'Tailwind', role: 'Styling' },
];

const frontendItems = [
    { icon: '⚛️', label: 'React + Next.js' },
    { icon: '🎨', label: 'Tailwind CSS' },
    { icon: '🔌', label: 'Socket.io Client' },
    { icon: '🔑', label: 'JWT Storage' },
];

const backendItems = [
    { icon: '🟢', label: 'Node.js + Express' },
    { icon: '🔌', label: 'Socket.io Server' },
    { icon: '🍃', label: 'MongoDB Atlas' },
    { icon: '🛡️', label: 'JWT Middleware' },
];

const TechCard = ({ logo, name, role }) => (
    <div
        className="rounded-[14px] p-7 text-center transition-all duration-250 cursor-default"
        style={{ background: 'var(--surface-panel)', border: '1px solid var(--surface-border)' }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand-subtle)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px var(--brand-glow)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <span className="block text-[32px] mb-3">{logo}</span>
        <div className="font-syne font-bold text-[13px] mb-1" style={{ color: 'var(--chat-primary)' }}>{name}</div>
        <div className="font-mono text-[11px]" style={{ color: 'var(--chat-faint)' }}>{role}</div>
    </div>
);

const ArchItem = ({ icon, label }) => (
    <div
        className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[10px] mb-2 text-[13px]"
        style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', color: 'var(--chat-secondary)' }}
    >
        <span className="text-[16px]">{icon}</span>
        {label}
    </div>
);

const TechStackSection = () => {
    const sectionRef = useRef(null);
    const archRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        if (archRef.current) observer.observe(archRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="tech" className="py-[100px] px-6 overflow-hidden" style={{ background: 'var(--surface-base)' }}>
            <div className="max-w-[1200px] mx-auto">
                {/* Label */}
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] mb-4"
                    style={{ color: 'var(--brand)' }}>
                    <span className="inline-block w-[18px] h-px" style={{ background: 'var(--brand)' }} />
                    Tech Stack
                </div>

                <h2 className="font-syne font-extrabold tracking-[-0.03em] leading-[1.1] mb-4"
                    style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--chat-primary)' }}>
                    Production-grade stack.<br />Zero compromises.
                </h2>

                <p className="text-[16px] leading-[1.7] mb-[60px]"
                    style={{ color: 'var(--chat-muted)', maxWidth: 520 }}>
                    Every technology chosen deliberately for performance, developer experience, and scalability.
                </p>

                {/* Tech cards */}
                <div ref={sectionRef} className="reveal grid grid-cols-5 gap-4 mb-12">
                    {techStack.map(t => <TechCard key={t.name} {...t} />)}
                </div>

                {/* Architecture diagram */}
                <div
                    ref={archRef}
                    className="reveal rounded-[16px] p-8 grid grid-cols-3 gap-6 items-center"
                    style={{ background: 'var(--surface-panel)', border: '1px solid var(--surface-border)' }}
                >
                    {/* Frontend */}
                    <div>
                        <div className="arch-col-title">Frontend</div>
                        {frontendItems.map(i => <ArchItem key={i.label} {...i} />)}
                    </div>

                    {/* Middle — WebSocket */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[20px] anim-arrow-pulse" style={{ color: 'var(--brand)' }}>⇄</div>
                        <div
                            className="font-mono text-[11.5px] font-medium text-center px-4 py-[10px] rounded-[10px]"
                            style={{ background: 'var(--brand-glow)', border: '1px solid var(--brand-subtle)', color: 'var(--brand)' }}
                        >
                            WebSocket<br />Socket.io
                        </div>
                        <div className="text-[20px] anim-arrow-pulse" style={{ color: 'var(--brand)' }}>⇄</div>
                    </div>

                    {/* Backend */}
                    <div>
                        <div className="arch-col-title">Backend</div>
                        {backendItems.map(i => <ArchItem key={i.label} {...i} />)}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
