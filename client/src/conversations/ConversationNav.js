import TalkStreamLogo from "../components/TalkStreamLogo";

const NAV_ITEMS = [
    { key: "chats", icon: ChatIcon, label: "Chats" },
    { key: "contacts", icon: ContactIcon, label: "Contacts" },
    { key: "calls", icon: CallIcon, label: "Calls" },
    { key: "groups", icon: GroupIcon, label: "Groups" },
];

const ConversationNav = ({ activeTab = "chats", onTabChange }) => (
    <div className="w-[64px] flex-shrink-0 bg-[#0A0C12] border-r border-surface-border flex flex-col items-center py-4 h-screen">

        {/* ── Logo ────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
            <TalkStreamLogo variant="logo" />
        </div>

        {/* ── Nav Icons ───────────────────────────────────────────────────────── */}
        <nav className="flex flex-col items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
                const isActive = activeTab === key;
                return (
                    <button
                        key={key}
                        title={label}
                        onClick={() => onTabChange?.(key)}
                        className={`
                            relative w-11 h-11 rounded-xl flex items-center justify-center
                            transition-all duration-200 group
                            ${isActive
                                ? "bg-brand/20 text-brand"
                                : "text-chat-faint hover:bg-surface-raised transition-all duration-200 hover:text-chat-muted"
                            }
            `}
                    >
                        <Icon size={20} />
                        {/* Active indicator pip */}
                        {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-1 h-5 bg-brand rounded-r-full" />
                        )}
                        {/* Tooltip */}
                        <span className="absolute left-14 bg-surface-muted text-chat-secondary text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 border border-surface-border">
                            {label}
                        </span>
                    </button>
                );
            })}
        </nav>

        {/* ── Bottom: Settings + Profile ──────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 mt-auto">
            <button
                title="Settings"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-chat-faint hover:bg-surface-raised hover:text-chat-muted transition-all duration-200 group relative"
            >
                <SettingsIcon size={20} />
                <span className="absolute left-14 bg-surface-muted text-chat-secondary text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 border border-surface-border">
                    Settings
                </span>
            </button>

            {/* My profile avatar */}
            <button
                title="My Profile"
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold font-mono text-xs tracking-wide transition-all duration-200 hover:ring-2 hover:ring-brand/40 mt-1"
                style={{ background: "#7C6FCD30", border: "1.5px solid #7C6FCD60", color: "#7C6FCD" }}
            >
                ME
            </button>
        </div>
    </div>
);

// ─── SVG Icon components ──────────────────────────────────────────────────────
function ChatIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
function ContactIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
function CallIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}
function GroupIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function SettingsIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export default ConversationNav;
