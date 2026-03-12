import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ConversationRoomHeader from "./chatComponent/ConversationRoomHeader";
import NoConversationSelected from "./chatComponent/NoConversationSelected";
import Loading from "../components/Loading";
import InputBar from "./chatComponent/InputBar";
import { formatTimestampOnWindow } from "../timeFormat/formatTimestamp";
import { TypingIndicator } from "./chatUtils";
import { FiChevronDown, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { IoBan } from "react-icons/io5";

const MessageBubble = ({ msg, isMe, onEdit, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const renderTicks = () => {
        if (!isMe) return null;
        if (msg.seenBy?.length > 1) {
            return <BsCheckAll className="inline ml-1" style={{ color: "#90cdf4" }} size={15} />;
        }
        return <BsCheck className="inline ml-1 opacity-80" size={15} />;
    };

    // ✅ Deleted placeholder
    if (msg.isDeleted) {
        return (
            <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="flex items-center gap-1 px-3.5 py-2.5 text-sm rounded-xl bg-surface-raised 
                                text-chat-faint italic border border-surface-muted">
                    <IoBan className="inline" size={18} /> This message was deleted
                </div>
            </div>
        );
    }

    return (
        // ✅ outer row — controls left/right alignment
        <div className={`flex mb-2 group ${isMe ? "justify-end" : "justify-start"}`}>
            {/* ✅ wrapper — max width lives here, position:relative for dropdown */}
            <div className="relative max-w-[65%]" ref={dropdownRef}>
                {/* ✅ Dropdown chevron — only for sender */}
                {isMe && (
                    <>
                        <button
                            onClick={() => setShowDropdown((p) => !p)}
                            className="absolute top-0 right-0 z-10
                                       opacity-0 group-hover:opacity-100 transition-opacity
                                       bg-brand-dark rounded p-0.5"
                        >
                            <FiChevronDown size={15} className="text-white" />
                        </button>

                        {/* Dropdown menu */}
                        {showDropdown && (
                            <div className="absolute right-0 top-6 bg-surface-panel 
                                            border border-surface-muted rounded-xl 
                                            shadow-lg py-1 w-32 z-20">
                                <button
                                    onClick={() => { onEdit(msg); setShowDropdown(false); }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs 
                                               text-chat-secondary hover:bg-surface-raised w-full"
                                >
                                    <FiEdit2 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => { onDelete(msg._id); setShowDropdown(false); }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs 
                                               text-red-400 hover:bg-surface-raised w-full"
                                >
                                    <FiTrash2 size={12} /> Delete
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ✅ Bubble — same classes as your original working UI */}
                <div className={`px-3.5 py-2.5 text-sm rounded-xl ${isMe
                        ? "bg-brand text-white"
                        : "bg-surface-raised text-chat-secondary"
                    }`}>
                    <p className="break-words">{msg.content}</p>
                    <span className="flex items-center justify-end gap-0.5 text-[10px] mt-1 opacity-70">
                        {msg.isEdited && (
                            <span className="text-[9px] opacity-60 mr-1">edited</span>
                        )}
                        {formatTimestampOnWindow(msg.createdAt)}
                        {renderTicks()}
                    </span>
                </div>

            </div>
        </div>
    );
};

const ConversationRoom = ({ conversation }) => {
    const {
        messages,
        sendMessage,
        loadMoreMessages,
        hasMore,
        loadingMessages,
        typingUsers,
        activeConversationId,
        setEditingMessage,
        emitDeleteMessage,
    } = useChatStore();

    const isTyping = typingUsers[activeConversationId];
    const { user } = useAuthStore();
    const bottomRef = useRef(null);
    const scrollRef = useRef(null);
    const prevLastId = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const lastId = messages.length ? messages[messages.length - 1]._id : null;
        if (prevLastId.current === null) {
            el.scrollTop = el.scrollHeight;
        } else if (lastId && lastId !== prevLastId.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        prevLastId.current = lastId;
    }, [messages]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop <= 20 && hasMore && !loadingMessages) {
            handleScroll();
        }
    }, [messages, hasMore, loadingMessages]);

    useEffect(() => {
        prevLastId.current = null;
    }, [conversation?._id]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop <= 20 && hasMore && !loadingMessages) {
            const previousHeight = el.scrollHeight;
            loadMoreMessages().then(() => {
                requestAnimationFrame(() => {
                    const newHeight = el.scrollHeight;
                    el.scrollTop = newHeight - previousHeight;
                });
            });
        }
    };

    if (!conversation) return <NoConversationSelected />;

    const otherUser = conversation.participants.find((p) => p._id !== user.id);

    return (
        <div className="flex-1 flex flex-col bg-surface-base h-screen min-w-0">
            <ConversationRoomHeader user={otherUser} />
            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto px-6 pt-6 pb-4 flex flex-col"
                >
                    {loadingMessages && <Loading width={20} height={20} />}

                    {messages.map((msg) => {
                        const isMe = msg.sender._id === user.id;
                        return (
                            <MessageBubble
                                key={msg._id}
                                msg={msg}
                                isMe={isMe}
                                onEdit={(msg) => setEditingMessage(msg)}
                                onDelete={(msgId) => emitDeleteMessage(msgId)}
                            />
                        );
                    })}

                    {isTyping && <TypingIndicator contact={otherUser} />}
                    <div ref={bottomRef} />
                </div>

                <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 
                                bg-gradient-to-b from-surface-base to-transparent" />
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