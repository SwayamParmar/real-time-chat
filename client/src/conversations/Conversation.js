import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import ConversationList from "./ConversationList";
import ConversationRoom from "./ConversationRoom";
import ConversationNav from "./ConversationNav";
import { GlobalStyles } from "./chatUtils";

const Conversation = () => {
    const {
        fetchConversations,
        initSocket,
        conversations,
        activeConversationId,
    } = useChatStore();

    useEffect(() => {
        initSocket();
        fetchConversations();
    }, []);

    // 🔥 derive selected conversation
    const selectedConversation = conversations.find(
        (c) => c._id === activeConversationId
    );

    return (
        <>
            <GlobalStyles />
            <div className="flex overflow-hidden h-screen bg-surface-base">
                <ConversationNav />
                <ConversationList />
                <ConversationRoom conversation={selectedConversation} />
            </div>
        </>
    );
};

export default Conversation;