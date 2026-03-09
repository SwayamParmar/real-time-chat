// ─── ContactAboutPanel.jsx ────────────────────────────────────────────────────
// Collapsible right panel showing contact details, shared media, and settings.
// Props:
//   contact  – contact object
//   onClose  – callback to hide the panel
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Avatar, StatusDot } from "./chatUtils";

const ConversationAbout = ({ contact, onClose }) => {
    const [muteNotifs, setMuteNotifs] = useState(false);
    const [blockContact, setBlockContact] = useState(false);

    return (
        <div
            className="w-[280px] flex-shrink-0 bg-surface-panel border-l border-surface-border flex flex-col h-screen overflow-y-auto"
            style={{ animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)" }}
        >
            {/* ── Top bar with back arrow ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-border flex-shrink-0">
                <button
                    onClick={onClose}
                    title="Close panel"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-chat-faint hover:bg-surface-raised hover:text-chat-secondary transition-all duration-200"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-chat-secondary font-semibold text-sm tracking-tight">Contact Info</span>
            </div>

            {/* ── Profile header ───────────────────────────────────────────────── */}
            <div className="flex flex-col items-center pt-6 pb-5 px-4 border-b border-surface-border">
                {/* Large avatar */}
                <div className="relative mb-3">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center font-bold font-mono text-2xl tracking-wide"
                        style={{
                            background: contact.color + "30",
                            border: `2px solid ${contact.color}60`,
                            color: contact.color,
                        }}
                    >
                        {contact.avatar}
                    </div>
                    <span className="absolute bottom-1 right-1">
                        <StatusDot status={contact.status} />
                    </span>
                </div>

                <h2 className="text-chat-primary font-bold text-base tracking-tight">{contact.name}</h2>
                <p className="text-chat-faint text-xs mt-0.5 font-sans">
                    {contact.status === "online" ? "🟢 Online now" : contact.status === "away" ? "🟡 Away" : "⚫ Offline"}
                </p>

                {/* Quick action buttons */}
                <div className="flex gap-3 mt-4">
                    {[
                        { icon: <PhoneIcon />, label: "Call" },
                        { icon: <VideoIcon />, label: "Video" },
                        { icon: <MuteIcon />, label: "Mute" },
                    ].map(({ icon, label }) => (
                        <button
                            key={label}
                            title={label}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <span className="w-10 h-10 bg-surface-raised border border-surface-muted rounded-xl flex items-center justify-center text-chat-faint group-hover:bg-surface-muted group-hover:text-brand transition-all duration-200">
                                {icon}
                            </span>
                            <span className="text-chat-ghost text-[10px] font-sans">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── About ────────────────────────────────────────────────────────── */}
            <div className="px-4 py-4 border-b border-surface-border">
                <p className="text-chat-ghost text-[10px] font-mono uppercase tracking-widest mb-2">About</p>
                <p className="text-chat-muted text-xs leading-relaxed font-sans">
                    Hey there! I'm using this app to stay connected. 🚀
                </p>
            </div>

            {/* ── Shared Media / Files / Links ─────────────────────────────────── */}
            <div className="flex flex-col py-2">
                {[
                    { label: "Shared Photos", count: 24, icon: <PhotoIcon /> },
                    { label: "Shared Files", count: 8, icon: <FileIcon /> },
                    { label: "Shared Links", count: 13, icon: <LinkIcon /> },
                ].map(({ label, count, icon }) => (
                    <button
                        key={label}
                        className="flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors duration-150 group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-surface-raised border border-surface-muted rounded-lg flex items-center justify-center text-chat-faint group-hover:text-brand transition-colors duration-150">
                                {icon}
                            </span>
                            <div className="text-left">
                                <p className="text-chat-secondary text-sm font-medium font-sans">{label}</p>
                                <p className="text-chat-ghost text-[11px] font-sans">{count} items</p>
                            </div>
                        </div>
                        <ChevronIcon />
                    </button>
                ))}
            </div>

            <div className="h-px bg-surface-border mx-4" />

            {/* ── Toggles ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col py-2">
                <ToggleRow
                    label="Mute Notifications"
                    icon={<BellIcon />}
                    value={muteNotifs}
                    onChange={setMuteNotifs}
                />
                <ToggleRow
                    label="Block Contact"
                    icon={<BlockIcon />}
                    value={blockContact}
                    onChange={setBlockContact}
                    danger
                />
            </div>

            <div className="h-px bg-surface-border mx-4" />

            {/* ── Danger actions ───────────────────────────────────────────────── */}
            <div className="flex flex-col py-2">
                <button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-raised transition-colors duration-150 group">
                    <span className="w-8 h-8 bg-surface-raised border border-surface-muted rounded-lg flex items-center justify-center text-[#EF4444] group-hover:bg-[#EF444415] transition-colors duration-150">
                        <TrashIcon />
                    </span>
                    <span className="text-[#EF4444] text-sm font-medium font-sans">Clear Chat</span>
                </button>
            </div>
        </div>
    );
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, icon, value, onChange, danger }) => (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors duration-150">
        <div className="flex items-center gap-3">
            <span className={`w-8 h-8 bg-surface-raised border border-surface-muted rounded-lg flex items-center justify-center ${danger ? "text-[#EF4444]" : "text-chat-faint"}`}>
                {icon}
            </span>
            <span className={`text-sm font-medium font-sans ${danger ? "text-[#EF4444]" : "text-chat-secondary"}`}>{label}</span>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? "bg-brand" : "bg-surface-muted"}`}
        >
            <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? "left-[22px]" : "left-0.5"}`}
            />
        </button>
    </div>
);

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const iconProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };

function PhoneIcon() { return <svg {...iconProps}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function VideoIcon() { return <svg {...iconProps}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>; }
function MuteIcon() { return <svg {...iconProps}><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>; }
function PhotoIcon() { return <svg {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>; }
function FileIcon() { return <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>; }
function LinkIcon() { return <svg {...iconProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>; }
function BellIcon() { return <svg {...iconProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function BlockIcon() { return <svg {...iconProps}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>; }
function TrashIcon() { return <svg {...iconProps}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>; }
function ChevronIcon() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chat-ghost"><polyline points="9 18 15 12 9 6" /></svg>; }

export default ConversationAbout;
