import { useMemo, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { Avatar } from "./chatUtils";
import { useChatLayout } from "./ChatLayoutContext";
import { lastMessagePreview } from "./lastMessagePreview";
import ConversationListHeader from "./chatComponent/ConversationListHeader";
import { ConversationSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatTimestampOnList } from "../timeFormat/formatTimestamp";
import { IoBan } from "react-icons/io5";
import { FiMessageCircle, FiSearch } from "react-icons/fi";

/* ─────────────────────────────────────────────────────────────
   Conversation list.

   Search filters the conversations already held in memory — it
   is presentation over data the store has fetched, and issues no
   request of its own. The input existed before with its state
   commented out, so it looked usable and did nothing.
───────────────────────────────────────────────────────────── */

const ConversationRow = ({ conv, otherUser, isActive, isOnline, isTyping, onOpen }) => {
    const { text, icon: PreviewIcon } = lastMessagePreview(conv.lastMessage);
    const unread = conv.unreadCount > 0;
    const timestamp = conv.lastMessage?.createdAt;

    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                aria-current={isActive ? "true" : undefined}
                className={`
                    w-full px-3 sm:px-4 py-2.5 flex items-center gap-3 text-left
                    border-l-2 transition-colors duration-150
                    focus-visible:outline-none focus-visible:bg-surface-raised
                    focus-visible:border-l-brand-highlight
                    ${isActive
                        ? "bg-surface-raised border-l-brand"
                        : "border-l-transparent hover:bg-surface-raised/60 active:bg-surface-raised"
                    }
                `}
            >
                <Avatar name={otherUser?.name} id={otherUser?._id} size="md" online={isOnline} />

                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                        <span
                            className={`truncate text-[14.5px] tracking-tight
                                ${unread ? "text-chat-primary font-bold" : "text-chat-secondary font-semibold"}`}
                        >
                            {otherUser?.name || "Unknown"}
                        </span>

                        {timestamp && (
                            <time
                                dateTime={timestamp}
                                className={`text-[11px] flex-shrink-0 tabular-nums
                                    ${unread ? "text-brand font-semibold" : "text-chat-ghost"}`}
                            >
                                {formatTimestampOnList(timestamp)}
                            </time>
                        )}
                    </span>

                    <span className="flex items-center justify-between gap-2">
                        <span
                            className={`flex items-center gap-1 min-w-0 text-[13px]
                                ${unread ? "text-chat-muted" : "text-chat-faint"}`}
                        >
                            {isTyping ? (
                                <span className="text-brand-highlight font-medium truncate">
                                    typing…
                                </span>
                            ) : conv.lastMessage?.isDeleted ? (
                                <>
                                    <IoBan aria-hidden="true" size={13} className="flex-shrink-0" />
                                    <span className="italic opacity-70 truncate">Message deleted</span>
                                </>
                            ) : (
                                <>
                                    {PreviewIcon && (
                                        <PreviewIcon aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{text}</span>
                                </>
                            )}
                        </span>

                        {unread && (
                            <span
                                className="flex-shrink-0 bg-brand text-white text-[10.5px] font-bold
                                           rounded-full px-1.5 h-[18px] min-w-[18px]
                                           inline-flex items-center justify-center tabular-nums"
                            >
                                {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                <span className="sr-only"> unread messages</span>
                            </span>
                        )}
                    </span>
                </span>
            </button>
        </li>
    );
};

const ConversationList = () => {
    const {
        onlineUsers,
        conversations,
        fetchMessages,
        activeConversationId,
        typingUsers,
        loadingConversations,
    } = useChatStore();
    const { user } = useAuthStore();
    const { openRoom } = useChatLayout();

    const [search, setSearch] = useState("");

    // Pair each conversation with the participant it is with, once, so a row
    // does not re-scan the participants array on every render pass.
    const rows = useMemo(
        () =>
            conversations.map((conv) => ({
                conv,
                otherUser: conv.participants?.find((p) => p._id !== user?.id),
            })),
        [conversations, user?.id]
    );

    const query = search.trim().toLowerCase();
    const visibleRows = useMemo(
        () =>
            query
                ? rows.filter(({ otherUser }) => otherUser?.name?.toLowerCase().includes(query))
                : rows,
        [rows, query]
    );

    const handleOpen = (conversationId) => {
        // Unchanged store call — the mobile pane switch is purely additive.
        fetchMessages(conversationId);
        openRoom();
    };

    return (
        <div className="flex flex-col h-full min-h-0 font-sans">
            <ConversationListHeader search={search} onSearchChange={setSearch} />

            <div className="flex-1 min-h-0 overflow-y-auto scroll-contain py-1.5">
                {loadingConversations ? (
                    <ConversationSkeleton />
                ) : conversations.length === 0 ? (
                    <EmptyState
                        icon={FiMessageCircle}
                        title="No conversations yet"
                        description="Start one with the compose button above and it will show up here."
                    />
                ) : visibleRows.length === 0 ? (
                    <EmptyState
                        compact
                        icon={FiSearch}
                        title="No matches"
                        description={`Nothing here matches "${search.trim()}".`}
                    />
                ) : (
                    <ul className="list-none m-0 p-0">
                        {visibleRows.map(({ conv, otherUser }) => (
                            <ConversationRow
                                key={conv._id}
                                conv={conv}
                                otherUser={otherUser}
                                isActive={activeConversationId === conv._id}
                                isOnline={onlineUsers.includes(otherUser?._id)}
                                isTyping={Boolean(typingUsers[conv._id])}
                                onOpen={() => handleOpen(conv._id)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
