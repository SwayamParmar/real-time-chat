/* ─────────────────────────────────────────────────────────────
   Chat-specific presentational bits.

   Avatar / StatusDot moved to components/ui/Avatar so every
   surface shares one size scale; they are re-exported here so
   existing imports keep working.

   GlobalStyles used to live here and injected a <style> tag at
   runtime that reset the body background to a third colour and
   redefined the scrollbar with values that disagreed with
   index.css. All of that now lives in index.css instead.
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
