import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ConversationRoomHeader from "./chatComponent/ConversationRoomHeader";
import NoConversationSelected from "./chatComponent/NoConversationSelected";
import Loading from "../components/Loading";
import InputBar from "./chatComponent/InputBar";
import { formatTimestampOnWindow } from "../timeFormat/formatTimestamp";
import { TypingIndicator } from "./chatUtils";

const ConversationRoom = ({ conversation }) => {
    const {
        messages,
        sendMessage,
        loadMoreMessages,
        hasMore,
        loadingMessages,
        typingUsers,
        activeConversationId
    } = useChatStore();
    const isTyping = typingUsers[activeConversationId];
    console.log(isTyping);

    const { user } = useAuthStore();
    const bottomRef = useRef(null);
    const scrollRef = useRef(null);

    // remember last message ID so we only auto-scroll when a NEW bottom message appears
    const prevLastId = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const lastId = messages.length ? messages[messages.length - 1]._id : null;

        // first time we see messages for this conversation, just jump immediately
        if (prevLastId.current === null) {
            // set scrollTop to bottom without animation
            el.scrollTop = el.scrollHeight;
        } else if (lastId && lastId !== prevLastId.current) {
            // a truly new message arrived at bottom
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        prevLastId.current = lastId;
    }, [messages]);

    // if we end up still at (or very near) the top after a load, try again
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop <= 20 && hasMore && !loadingMessages) {
            handleScroll();
        }
    }, [messages, hasMore, loadingMessages]);

    // reset tracking when switching conversations so initial load logic runs
    useEffect(() => {
        prevLastId.current = null;
    }, [conversation?._id]);

    // ✅ Infinite scroll — load older messages and restore offset
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        // make the trigger a little forgiving to account for bounce/rounding
        if (el.scrollTop <= 20 && hasMore && !loadingMessages) {
            const previousHeight = el.scrollHeight;
            loadMoreMessages().then(() => {
                // give React/DOM one frame (loader removed, new messages rendered)
                requestAnimationFrame(() => {
                    const newHeight = el.scrollHeight;
                    el.scrollTop = newHeight - previousHeight;
                });
            });
        }
    };

    if (!conversation) return <NoConversationSelected />;

    const otherUser = conversation.participants.find(p => p._id !== user.id);

    return (
        <div className="flex-1 flex flex-col bg-surface-base h-screen min-w-0">
            <ConversationRoomHeader user={otherUser} />
            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto px-6 pt-6 pb-4 flex flex-col"
                >
                    {/* ✅ Loading spinner at top when fetching older messages */}
                    {loadingMessages && (
                        <Loading width={20} height={20} />
                    )}

                    {messages.map((msg) => {
                        const isMe = msg.sender._id === user.id;
                        return (
                            <div
                                key={msg._id}
                                className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                            <div
                                    className={`max-w-[65%] px-3.5 py-2.5 text-sm rounded-2xl ${
                                        isMe
                                            ? "bg-brand text-white"
                                            : "bg-surface-raised text-chat-secondary"
                                    }`}
                                >
                                    <p>{msg.content}</p>
                                    <span className="block text-[10px] text-right mt-1 opacity-70">
                                        {formatTimestampOnWindow(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {isTyping && <TypingIndicator contact={otherUser} />}
                    <div ref={bottomRef} />
                </div>

                {/* Top Fade */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-surface-base to-transparent" />
            </div>

            <InputBar
                onSend={(text) =>
                    sendMessage({ conversationId: conversation._id, content: text })
                }
            />
        </div>
    );
};

export default ConversationRoom;