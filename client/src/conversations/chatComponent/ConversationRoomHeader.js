// components/ConversationRoomHeader.js
import { Avatar, StatusDot } from "../chatUtils";
import {
    FiPhone,
    FiVideo,
    FiSearch,
    FiMoreVertical,
} from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";

const ConversationRoomHeader = ({ user }) => {
    const { typingUsers, activeConversationId } = useChatStore();
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
                    <span className="absolute bottom-0.5 right-0.5">
                        <StatusDot status="offline" />
                    </span>
                </div>

                <div>
                    <p className="text-chat-primary font-semibold text-sm">
                        {user?.name}
                    </p>
                    {isTyping && (
                        <p className="text-chat-faint font-semibold text-sm">
                            <span className="text-brand italic">typing...</span>
                        </p>
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