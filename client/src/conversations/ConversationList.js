import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { Avatar, StatusDot } from "./chatUtils";
import ConversationListHeader from "./chatComponent/ConversationListHeader";
import Loading from "../components/Loading";
import { formatTimestampOnList } from "../timeFormat/formatTimestamp";
import { IoBan } from "react-icons/io5";
import { HiMiniPhoto, HiVideoCamera, HiDocument } from "react-icons/hi2";

const ConversationList = () => {
    const { onlineUsers, conversations, fetchMessages, activeConversationId, typingUsers, loadingConversations } = useChatStore();
    const { user } = useAuthStore();

    return (
        <div className="w-[360px] min-w-[260px] bg-surface-panel border-r border-r-white/10 flex flex-col h-screen font-sans">
            <ConversationListHeader />
            <div className="flex-1 overflow-y-auto py-2">
                {loadingConversations ? (
                    <div className="flex items-center justify-center h-full">
                        <Loading width={40} height={40} />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-chat-faint text-sm text-center mt-10">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const otherUser = conv.participants.find(
                            p => p._id !== user.id
                        );
                        const titleMessage = conv.lastMessage?.messageType === "text"
                            ? conv.lastMessage?.content
                            : conv.lastMessage?.messageType === "image"
                                ? "Sent a photo"
                                : conv.lastMessage?.messageType === "video"
                                    ? "Sent a video"
                                    : conv.lastMessage?.messageType === "file"
                                        ? conv.lastMessage?.file?.name || "Sent a file"
                                        : conv.lastMessage?.content;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => fetchMessages(conv._id)}
                                className={`
                                    w-full px-5 py-2.5 flex items-center gap-3 text-left
                                    border-l-2 transition-all duration-150 
                                    ${activeConversationId === conv._id ? "bg-surface-border border-brand" : "bg-transparent border-transparent hover:bg-[#161920]"} `}
                            >
                                <div className="relative">
                                    <Avatar
                                        text={otherUser?.name?.slice(0, 2).toUpperCase()}
                                        color="#7C6FCD"
                                        size={42}
                                    />
                                    {onlineUsers.includes(otherUser?._id) && (
                                        <span className="absolute bottom-0.5 right-0.5">
                                            <StatusDot status='online' />
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-chat-secondary font-semibold text-sm tracking-tight truncate">
                                            {otherUser?.name}
                                        </span>
                                        <span className="text-chat-ghost text-[11px] flex-shrink-0 ml-1.5">
                                            {conv.lastMessage?.createdAt ? formatTimestampOnList(conv.lastMessage.createdAt) : ""}
                                        </span>
                                    </div>

                                    <div className="flex justify-between mt-0.5">
                                        <span className="text-chat-faint text-xs truncate max-w-[200px]" title={titleMessage}>
                                            {typingUsers[conv._id] ? (
                                                <span className="text-brand italic">typing...</span>
                                            ) : conv.lastMessage?.isDeleted ? (
                                                <span className="italic opacity-50 flex gap-1">
                                                    <IoBan className="inline" size={15} /> Message deleted
                                                </span>
                                            ) : (
                                                conv.lastMessage?.messageType === "text" ? (
                                                    conv.lastMessage?.content
                                                ) : conv.lastMessage?.messageType === "image" ? (
                                                    <span className="flex items-center gap-1">
                                                        <HiMiniPhoto className="w-4 h-4" />
                                                        Sent a photo
                                                    </span>
                                                ) : conv.lastMessage?.messageType === "video" ? (
                                                    <span className="flex items-center gap-1">
                                                        <HiVideoCamera className="w-4 h-4" />
                                                        Sent a video
                                                    </span>
                                                ) : conv.lastMessage?.messageType === "file" ? (
                                                    <span className="flex items-center gap-1">
                                                        <HiDocument className="w-4 h-4" />
                                                        {conv.lastMessage?.file?.name || "Sent a file"}
                                                    </span>
                                                ) : (
                                                    conv.lastMessage?.content
                                                )
                                            )}
                                        </span>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-brand text-white text-[10px] font-bold rounded-[10px] px-1.5 min-w-[18px] text-center flex-shrink-0 ml-1.5">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;