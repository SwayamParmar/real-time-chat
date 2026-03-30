import React from 'react';

const stats = [
    { num: '12', suffix: '+', label: 'Modules Built' },
    { num: '<50', label: 'Message Latency', suffix: 'ms' },
    { num: '∞', label: 'Scroll History' },
    { num: 'Real', suffix: '-Time', label: 'Bi-directional I/O' },
    { num: '5', suffix: '+', label: 'Tech Stack Layers' },
];

const StatItem = ({ num, suffix, label }) => (
    <div className="text-center">
        <div
            className="font-syne font-extrabold leading-[1] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(26px, 3vw, 32px)', color: 'var(--chat-primary)' }}
        >
            {num}
            {suffix && <span style={{ color: 'var(--brand)' }}>{suffix}</span>}
        </div>
        <div
            className="font-mono text-[11px] uppercase tracking-[0.06em] mt-1"
            style={{ color: 'var(--chat-faint)' }}
        >
            {label}
        </div>
    </div>
);

const StatDivider = () => (
    <div className="w-px h-10 hide-sm" style={{ background: 'var(--surface-border)' }} />
);

const StatsStrip = () => (
    <div
        className="relative stats-shine"
        style={{ borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-panel)', padding: '28px 24px' }}
    >
        <div className="max-w-[1200px] mx-auto flex items-center justify-around flex-wrap gap-6 relative z-[1]">
            {stats.map((s, i) => (
                <React.Fragment key={s.label}>
                    <StatItem {...s} />
                    {i < stats.length - 1 && <StatDivider />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

export default StatsStrip;
