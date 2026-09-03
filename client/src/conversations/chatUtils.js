/* ─────────────────────────────────────────────────────────────
   Chat-specific presentational bits.

   Avatar / StatusDot live in components/ui/Avatar and are
   re-exported here so existing imports keep working.
───────────────────────────────────────────────────────────── */

import { Avatar } from "../components/ui/Avatar";

export { Avatar, StatusDot } from "../components/ui/Avatar";

// ─── TypingIndicator ──────────────────────────────────────────
export const TypingIndicator = ({ contact }) => (
    <div className="flex items-end gap-2 mb-1 animate-fade-slide-in">
        <Avatar name={contact?.name} id={contact?._id} size="xs" />

        <div
            className="bg-surface-raised border border-surface-border rounded-bubble-them
                       px-3.5 py-3 flex gap-1 items-center"
            // Announced politely, so a screen-reader user learns the other
            // person is typing without the three dots being read as content.
            role="status"
            aria-label={contact?.name ? `${contact.name} is typing` : "Typing"}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-chat-faint animate-typing-bounce-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-chat-faint animate-typing-bounce-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-chat-faint animate-typing-bounce-2" />
        </div>
    </div>
);
