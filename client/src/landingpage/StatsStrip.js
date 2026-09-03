import React from 'react';

/* Figures reflect what the app actually does. */
const STATS = [
    { num: '<50', suffix: 'ms', label: 'Message Latency' },
    { num: '3', suffix: '-stage', label: 'Delivery Receipts' },
    { num: '∞', suffix: '', label: 'Scroll History' },
    { num: '20', suffix: 'MB', label: 'Max Attachment' },
    { num: '100', suffix: '%', label: 'Typed Backend' },
];

const StatItem = ({ num, suffix, label }) => (
    <div
        className="text-center px-3 py-5"
        style={{
            background: 'var(--surface-panel)',
            boxShadow: '0 0 0 1px var(--surface-border)',
        }}
    >
        <div
            className="font-display font-extrabold leading-[1] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(24px, 3vw, 32px)', color: 'var(--chat-primary)' }}
        >
            {num}
            {suffix && <span style={{ color: 'var(--brand)' }}>{suffix}</span>}
        </div>
        <div
            className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.06em] mt-[6px]"
            style={{ color: 'var(--chat-faint)' }}
        >
            {label}
        </div>
    </div>
);

/* Each tile carries its own 1px ring and the grid gap is 1px, so adjacent
   rings meet to form shared rules that re-flow at every breakpoint. */
const StatsStrip = () => (
    <div
        className="px-5 sm:px-6 py-8 sm:py-9"
        style={{
            borderTop: '1px solid var(--surface-border)',
            borderBottom: '1px solid var(--surface-border)',
            background: 'var(--surface-panel)',
        }}
    >
        <div className="container-ts grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px">
            {STATS.map((s) => (
                <StatItem key={s.label} {...s} />
            ))}
        </div>
    </div>
);

export default StatsStrip;
