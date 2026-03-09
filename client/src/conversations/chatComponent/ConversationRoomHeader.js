// components/ConversationRoomHeader.js
import { Avatar, StatusDot } from "../chatUtils";
import {
    FiPhone,
    FiVideo,
    FiSearch,
    FiMoreVertical,
} from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";
import { formatLastSeen } from "../../timeFormat/formatTimestamp";

const ConversationRoomHeader = ({ user }) => {
    const { onlineUsers, typingUsers, activeConversationId } = useChatStore();
    const isOnline = onlineUsers.includes(user?._id);
    const isTyping = typingUsers[activeConversationId];

    return (
        <div className="px-5 py-3.5 bg-surface-panel border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar
                        text={user?.name?.slice(0, 2).toUpperCase()}
                        color="#7C6FCD"
                        size={40}
                    />
                </div>

                <div>
                    <p className="text-chat-primary font-semibold text-sm">
                        {user?.name}
                    </p>
                    {isTyping ? (
                        <span className="text-brand italic">typing...</span>
                    ) : isOnline ? (
                        <span className="text-green-500 text-sm">Online</span>
                    ) : (
                        <span className="text-chat-faint text-sm">{formatLastSeen(user?.lastSeen)}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-chat-faint">
                <FiPhone className="w-5 h-5" />
                <FiVideo className="w-5 h-5" />
                <FiSearch className="w-5 h-5" />
                <FiMoreVertical className="w-5 h-5" />
            </div>
        </div>
    );
};

export default ConversationRoomHeader;