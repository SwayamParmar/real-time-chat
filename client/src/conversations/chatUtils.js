// ─── StatusDot ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    online: "bg-status-online shadow-[0_0_6px_rgba(34,197,94,0.7)]",
    away: "bg-status-away",
    offline: "bg-status-offline",
};

export const StatusDot = ({ status }) => (
    <span
        className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-surface-panel flex-shrink-0 ${STATUS_COLORS[status] ?? STATUS_COLORS.offline}`}
    />
);
// ─── Avatar ───────────────────────────────────────────────────────────────────
const SIZE_MAP = {
    30: "w-[30px] h-[30px] text-[10px]",
    40: "w-10 h-10 text-sm",
    42: "w-[42px] h-[42px] text-sm",
};

export const Avatar = ({ text, color, size = 40 }) => (
    <div
        className={`${SIZE_MAP[size] ?? SIZE_MAP[40]} rounded-full flex items-center justify-center font-bold font-mono flex-shrink-0 tracking-wide transition-transform hover:scale-105`}
        style={{ background: color + "30", border: `1.5px solid ${color}60`, color }}
    >
        {text}
    </div>
);

// ─── TypingIndicator ──────────────────────────────────────────────────────────
export const TypingIndicator = ({ contact }) => (
    <div className="flex items-end gap-2 mb-2.5">
        <Avatar initials={contact.avatar} color={contact.color} size={30} />
        <div className="bg-surface-raised border border-surface-muted rounded-[18px_18px_18px_4px] px-4 py-3 flex gap-1 items-center">
            {["animate-typing-dot-0", "animate-typing-dot-1", "animate-typing-dot-2"].map((cls, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full bg-chat-faint inline-block ${cls}`} />
            ))}
        </div>
    </div>
);

// ─── GlobalStyles (inject once in App or index.css) ───────────────────────────
export const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0F16; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2130; border-radius: 4px; }
        button { outline: none; }
        input  { outline: none; }
    `}</style>
);
