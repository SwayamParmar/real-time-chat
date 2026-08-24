// components/ConversationRoomHeader.js
import { Avatar } from "../chatUtils";
import { useChatLayout } from "../ChatLayoutContext";
import IconButton from "../../components/ui/IconButton";
import {
    FiArrowLeft,
    FiPhone,
    FiVideo,
    FiSearch,
    FiMoreVertical,
} from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";
import { formatLastSeen } from "../../timeFormat/formatTimestamp";

/* ─────────────────────────────────────────────────────────────
   Room header.

   The call / video / search / overflow icons were previously
   bare <svg> elements: no button semantics, no label, no focus,
   no keyboard access — and no behaviour behind them either.
   They are real disabled buttons now, so they are announced and
   presented honestly as not-yet-available rather than looking
   live and silently doing nothing.
───────────────────────────────────────────────────────────── */

const ACTIONS = [
    { icon: FiPhone, label: "Voice call" },
    { icon: FiVideo, label: "Video call" },
    { icon: FiSearch, label: "Search in conversation" },
];

const ConversationRoomHeader = ({ user }) => {
    const { onlineUsers, typingUsers, activeConversationId } = useChatStore();
    const { closeRoom } = useChatLayout();

    const isOnline = onlineUsers.includes(user?._id);
    const isTyping = typingUsers[activeConversationId];

    return (
        <header
            className="flex-shrink-0 flex items-center gap-1 sm:gap-2
                       px-2 sm:px-4 py-2.5
                       pt-[max(0.625rem,var(--safe-top))]
                       bg-surface-panel border-b border-surface-border"
        >
            {/* Back to the list — phones only; the two panes sit side by side
                from md up, where there is nothing to go back to. */}
            <IconButton
                label="Back to conversations"
                icon={FiArrowLeft}
                iconSize={20}
                onClick={closeRoom}
                className="md:hidden"
            />

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <Avatar name={user?.name} id={user?._id} size="sm" online={isOnline} />

                <div className="min-w-0">
                    <p className="text-chat-primary font-semibold text-[13.5px] sm:text-[14.5px] tracking-tight truncate m-0">
                        {user?.name}
                    </p>

                    {/* One line, three states — kept at a fixed size so the
                        header never reflows as presence changes. */}
                    <p className="text-[11px] sm:text-[12px] leading-tight truncate m-0 mt-0.5">
                        {isTyping ? (
                            <span className="text-brand-highlight font-medium">typing…</span>
                        ) : isOnline ? (
                            <span className="text-status-online">Online</span>
                        ) : (
                            <span className="text-chat-faint">{formatLastSeen(user?.lastSeen)}</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0">
                {ACTIONS.map(({ icon, label }) => (
                    <IconButton
                        key={label}
                        label={`${label} (coming soon)`}
                        icon={icon}
                        disabled
                        // Voice and video are desktop-only chrome for now; on a
                        // phone the header space is better spent on the name.
                        className="hidden sm:inline-flex"
                    />
                ))}

                <IconButton label="More options (coming soon)" icon={FiMoreVertical} disabled />
            </div>
        </header>
    );
};

export default ConversationRoomHeader;
