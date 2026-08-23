import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ConversationRoomHeader from "./chatComponent/ConversationRoomHeader";
import NoConversationSelected from "./chatComponent/NoConversationSelected";
import Loading from "../components/Loading";
import InputBar from "./chatComponent/InputBar";
import IconButton from "../components/ui/IconButton";
import EmptyState from "../components/ui/EmptyState";
import { MessageSkeleton } from "../components/ui/Skeleton";
import {
    formatDateSeparator,
    formatTimestampOnWindow,
} from "../timeFormat/formatTimestamp";
import { TypingIndicator } from "./chatUtils";
import {
    FiAlertCircle,
    FiChevronDown,
    FiEdit2,
    FiSend,
    FiTrash2,
    FiUploadCloud,
} from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { IoBan } from "react-icons/io5";
import FilePreviewModal from "./chatComponent/FilePreviewModal";
import { FaFileAlt } from "react-icons/fa";

// Consecutive messages from the same person inside this window are drawn as
// one visual run: no repeated timestamp, tight spacing, tucked corners.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Date separator ───────────────────────────────────────────
const DateSeparator = ({ value }) => (
    <div className="flex items-center justify-center my-3 first:mt-0">
        <span
            className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wide
                       bg-surface-raised/80 border border-surface-border text-chat-faint
                       backdrop-blur-sm"
        >
            {formatDateSeparator(value)}
        </span>
    </div>
);

// ─── Delivery ticks ───────────────────────────────────────────
const DeliveryTicks = ({ msg }) => {
    // Blue double tick — seen
    if (msg.seenBy?.length > 1) {
        return (
            <BsCheckAll
                size={16}
                className="inline ml-0.5 flex-shrink-0 text-sky-300"
                role="img"
                aria-label="Seen"
            />
        );
    }

    // Grey double tick — delivered
    if (msg.deliveredTo?.length > 0) {
        return (
            <BsCheckAll
                size={16}
                className="inline ml-0.5 flex-shrink-0 opacity-80"
                role="img"
                aria-label="Delivered"
            />
        );
    }

    // Single tick — sent only
    return (
        <BsCheck
            size={16}
            className="inline ml-0.5 flex-shrink-0 opacity-80"
            role="img"
            aria-label="Sent"
        />
    );
};

// ─── Message actions (edit / delete) ──────────────────────────
const MessageActions = ({ msg, onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        // A flex sibling of the bubble rather than an overlay on top of it.
        // Overlaid, it covered the last word of every short outgoing message —
        // permanently on touch, where there is no hover to hide it behind.
        <div ref={wrapRef} className="relative flex-shrink-0 self-center">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-label="Message actions"
                aria-expanded={open}
                aria-haspopup="menu"
                // The chip stays small; the button around it is a full 44px on
                // touch, where tapping it is the only route to edit and delete.
                //
                // Touch has no hover, so the chip cannot hide until pointed at.
                // It stays dimmed instead — present and reachable, but quiet
                // enough that a screenful of them does not read as a toolbar.
                className={`
                    w-11 h-11 md:w-7 md:h-7 flex items-center justify-center group/act
                    transition-opacity duration-150
                    focus-visible:opacity-100
                    ${open ? "opacity-100" : "opacity-40 md:opacity-0 md:group-hover:opacity-100"}
                `}
            >
                <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-surface-raised border border-surface-border text-chat-faint
                               transition-colors group-hover/act:text-chat-primary"
                >
                    <FiChevronDown size={15} />
                </span>
            </button>

            {open && (
                <div
                    role="menu"
                    // Opens to the right of the trigger, which sits on the far
                    // side of the bubble — so it can never run off-screen.
                    className="absolute left-0 top-full mt-1 w-36 py-1 z-20 animate-pop-in origin-top-left
                               bg-surface-panel border border-surface-border rounded-xl shadow-panel"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            onEdit(msg);
                            setOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left text-[13px]
                                   text-chat-secondary hover:bg-surface-raised transition-colors"
                    >
                        <FiEdit2 size={13} aria-hidden="true" /> Edit
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            onDelete(msg._id);
                            setOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left text-[13px]
                                   text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <FiTrash2 size={13} aria-hidden="true" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Message bubble ───────────────────────────────────────────
const MessageBubble = memo(({ msg, isMe, isGroupStart, isGroupEnd, onEdit, onDelete }) => {
    // ✅ Deleted placeholder
    if (msg.isDeleted) {
        return (
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} ${isGroupEnd ? "mb-2" : "mb-0.5"}`}>
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] rounded-2xl bg-surface-raised text-chat-faint italic border border-surface-border">
                    <IoBan aria-hidden="true" size={15} className="flex-shrink-0" />
                    This message was deleted
                </div>
            </div>
        );
    }

    const radius = isMe
        ? isGroupEnd
            ? "rounded-bubble-me"
            : "rounded-bubble-mid-me"
        : isGroupEnd
            ? "rounded-bubble-them"
            : "rounded-bubble-mid-them";

    const hasMedia = Boolean(msg.file?.url) && msg.messageType !== "text";

    return (
        <div
            className={`flex group items-end gap-1 ${isMe ? "justify-end" : "justify-start"} ${isGroupEnd ? "mb-2" : "mb-0.5"} ${isGroupStart ? "mt-1" : ""}`}
        >
            {/* Sits before the bubble in the flex row, so an outgoing message
                gets its actions on the outside edge. */}
            {isMe && <MessageActions msg={msg} onEdit={onEdit} onDelete={onDelete} />}

            {/* relative lives here so the upload/failure overlays actually
                anchor to the bubble — they used to be absolutely positioned
                against whatever ancestor happened to be positioned. */}
            <div
                className={`
                    relative min-w-0 max-w-[85%] xs:max-w-[80%] sm:max-w-[72%] lg:max-w-[560px]
                    text-[14.5px] leading-[1.45] ${radius}
                    ${hasMedia ? "p-1" : "px-3.5 py-2"}
                    ${isMe ? "bg-brand text-white" : "bg-surface-raised text-chat-secondary"}
                `}
            >

                {/* ✅ Image message */}
                {msg.messageType === "image" && msg.file?.url && (
                    <div className="relative overflow-hidden rounded-[14px]">
                        <img
                            src={msg.file.url}
                            alt={msg.file.name || "Shared image"}
                            loading="lazy"
                            decoding="async"
                            className={`block w-auto max-w-full max-h-[min(340px,50dvh)] object-cover
                                        ${msg.uploading ? "opacity-50 blur-[1px]" : "cursor-pointer"}`}
                            onClick={() => !msg.uploading && window.open(msg.file.url, "_blank", "noopener")}
                        />

                        {msg.uploading && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    role="status"
                                    aria-label="Uploading image"
                                />
                            </span>
                        )}

                        {/* Honest failure state: the store has no retry action,
                            so this does not pretend to offer one. */}
                        {msg.uploadFailed && (
                            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                                <FiAlertCircle size={20} className="text-red-300" aria-hidden="true" />
                                <span className="text-white text-[11px] font-medium">Upload failed</span>
                            </span>
                        )}
                    </div>
                )}

                {/* ✅ Video message */}
                {msg.messageType === "video" && msg.file?.url && (
                    <video
                        src={msg.file.url}
                        controls
                        // Only the poster frame is fetched until the user plays,
                        // so a scrollback full of clips is not a download storm.
                        preload="metadata"
                        className="block max-w-full max-h-[min(340px,50dvh)] rounded-[14px]"
                    />
                )}

                {/* ✅ File/document message */}
                {msg.messageType === "file" && msg.file?.url && (
                    <button
                        type="button"
                        disabled={msg.uploading}
                        onClick={() => window.open(msg.file?.url, "_blank", "noopener")}
                        className={`flex items-center gap-3 p-2.5 rounded-[14px] w-full text-left
                                    bg-black/15 transition-colors
                                    ${msg.uploading ? "cursor-default" : "hover:bg-black/25"}`}
                    >
                        <FaFileAlt size={26} className="text-white/80 flex-shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-medium truncate">{msg.file?.name}</span>
                            <span className="block text-[11px] opacity-70 mt-0.5">
                                {msg.uploading ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                                        Uploading…
                                    </span>
                                ) : msg.uploadFailed ? (
                                    <span className="text-red-300">Upload failed</span>
                                ) : (
                                    formatFileSize(msg.file?.size)
                                )}
                            </span>
                        </span>
                    </button>
                )}

                {/* ✅ Caption or text content */}
                {msg.content && (
                    <p className={`wrap-anywhere whitespace-pre-wrap m-0 ${hasMedia ? "px-2.5 pt-1.5" : ""}`}>
                        {msg.content}
                    </p>
                )}

                {/* Meta line — normally only on the last bubble of a run, so a
                    burst of messages is not five repetitions of the same
                    minute. An edited message always shows its own line though:
                    "edited" is a fact about that message, not about the run,
                    and suppressing it would quietly drop information. */}
                {(isGroupEnd || msg.isEdited) && (
                    <span
                        className={`flex items-center justify-end gap-0.5 text-[10.5px] opacity-70 mt-0.5
                                    ${hasMedia ? "px-2.5 pb-1" : ""}`}
                    >
                        {msg.isEdited && <span className="mr-1 italic">edited</span>}
                        <time dateTime={msg.createdAt} className="tabular-nums">
                            {formatTimestampOnWindow(msg.createdAt)}
                        </time>
                        {isMe && <DeliveryTicks msg={msg} />}
                    </span>
                )}
            </div>
        </div>
    );
});

MessageBubble.displayName = "MessageBubble";

// ─── Room ─────────────────────────────────────────────────────
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
        uploadAndSend,
    } = useChatStore();

    const isTyping = typingUsers[activeConversationId];
    const { user } = useAuthStore();
    const bottomRef = useRef(null);
    const scrollRef = useRef(null);
    const prevLastId = useRef(null);
    const [previewFiles, setPreviewFiles] = useState(null); // null = closed
    const [isDragging, setIsDragging] = useState(false);
    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    const dragCounter = useRef(0);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, hasMore, loadingMessages]);

    useEffect(() => {
        prevLastId.current = null;
        setShowJumpToLatest(false);
    }, [conversation?._id]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        // UI only: reveal the jump-to-latest affordance once the reader has
        // scrolled a screenful away from the newest message.
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowJumpToLatest(distanceFromBottom > 240);

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

    // ✅ Drag & Drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        if (e.dataTransfer.items?.length > 0) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // required to allow drop
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) setPreviewFiles(files);
    };

    const handleSendFiles = ({ files, caption }) => {
        // ✅ Use uploadAndSend from store — non blocking
        uploadAndSend({
            files,
            caption,
            conversationId: conversation._id,
        });
    };

    const handleEdit = useCallback((msg) => setEditingMessage(msg), [setEditingMessage]);
    const handleDelete = useCallback((msgId) => emitDeleteMessage(msgId), [emitDeleteMessage]);

    /*
     * Grouping and day boundaries are derived from the message list rather
     * than stored anywhere: the store keeps exactly the shape it always had.
     */
    const rendered = useMemo(() => {
        const dayKeyOf = (m) => new Date(m.createdAt).toDateString();
        const withinWindow = (a, b) =>
            Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_WINDOW_MS;

        return messages.map((msg, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const day = dayKeyOf(msg);

            const showDate = !prev || dayKeyOf(prev) !== day;

            const continuesPrev =
                !showDate &&
                prev?.sender?._id === msg.sender?._id &&
                !prev?.isDeleted &&
                !msg.isDeleted &&
                withinWindow(prev, msg);

            const continuesIntoNext =
                next &&
                dayKeyOf(next) === day &&
                next.sender?._id === msg.sender?._id &&
                !next.isDeleted &&
                !msg.isDeleted &&
                withinWindow(msg, next);

            return {
                msg,
                showDate,
                isGroupStart: !continuesPrev,
                isGroupEnd: !continuesIntoNext,
            };
        });
    }, [messages]);

    if (!conversation) return <NoConversationSelected />;

    const otherUser = conversation.participants.find((p) => p._id !== user.id);
    const isFirstLoad = loadingMessages && messages.length === 0;

    return (
        <div
            className="relative flex-1 min-h-0 flex flex-col bg-surface-base"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* ✅ File Preview Modal */}
            {previewFiles && (
                <FilePreviewModal
                    files={previewFiles}
                    onClose={() => setPreviewFiles(null)}
                    onSend={handleSendFiles}
                />
            )}

            {/* ✅ Drag overlay — no bg color, just border + icon */}
            {isDragging && (
                <div
                    className="absolute inset-3 z-40 border-2 border-dashed border-brand
                               rounded-2xl flex flex-col items-center justify-center gap-3
                               pointer-events-none backdrop-blur-[10px] bg-surface-base/40"
                >
                    <FiUploadCloud size={40} className="text-brand" aria-hidden="true" />
                    <p className="text-brand font-semibold text-base">Drop to send</p>
                </div>
            )}

            <ConversationRoomHeader user={otherUser} />

            <div className="relative flex-1 min-h-0">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto scroll-contain
                               px-3 sm:px-5 lg:px-6 pt-4 pb-3 flex flex-col"
                >
                    {isFirstLoad ? (
                        <MessageSkeleton />
                    ) : (
                        <>
                            {/* Pagination spinner sits above the older messages
                                it is fetching, not over the whole thread. */}
                            {loadingMessages && <Loading width={20} height={20} />}

                            {messages.length === 0 && (
                                <div className="flex-1 flex items-center justify-center">
                                    <EmptyState
                                        icon={FiSend}
                                        title={`Say hello to ${otherUser?.name || "them"}`}
                                        description="This is the very beginning of your conversation."
                                    />
                                </div>
                            )}

                            {rendered.map(({ msg, showDate, isGroupStart, isGroupEnd }) => (
                                <div key={msg._id}>
                                    {showDate && <DateSeparator value={msg.createdAt} />}
                                    <MessageBubble
                                        msg={msg}
                                        isMe={msg.sender?._id === user.id}
                                        isGroupStart={isGroupStart}
                                        isGroupEnd={isGroupEnd}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {isTyping && <TypingIndicator contact={otherUser} />}
                    <div ref={bottomRef} />
                </div>

                {/*
                 * There is deliberately no top scrim here. The header above is
                 * fully opaque, so nothing scrolls out from under it that a
                 * fade would need to soften — the old gradient only washed out
                 * the topmost visible message.
                 */}

                {/* Jump to latest */}
                {showJumpToLatest && (
                    <IconButton
                        label="Jump to latest messages"
                        icon={FiChevronDown}
                        iconSize={20}
                        size="lg"
                        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="absolute bottom-4 right-4 z-20 animate-fade-slide-in
                                   bg-surface-raised border border-surface-border
                                   text-chat-secondary shadow-panel hover:text-chat-primary"
                    />
                )}
            </div>

            <InputBar
                onSend={(text) =>
                    sendMessage({ conversationId: conversation._id, content: text })
                }
                onFileSelect={(files) => setPreviewFiles(files)}
            />
        </div>
    );
};

export default ConversationRoom;
