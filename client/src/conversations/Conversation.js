import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import ConversationList from "./ConversationList";
import ConversationRoom from "./ConversationRoom";
import ConversationNav from "./ConversationNav";
import { ChatLayoutProvider, useChatLayout } from "./ChatLayoutContext";

/* ─────────────────────────────────────────────────────────────
   Chat shell.

   Desktop (md and up)   [ rail ][ list ][ room ]
   Mobile   (below md)   [ list ]  ⇄  [ room ]

   Both panes stay mounted on mobile and are swapped with
   visibility rather than being conditionally rendered, so
   returning to the list never discards the room's scroll
   position or forces its messages to re-render from scratch.
───────────────────────────────────────────────────────────── */

const ChatShell = () => {
    const {
        fetchConversations,
        initSocket,
        conversations,
        activeConversationId,
    } = useChatStore();

    const { roomOpenOnMobile } = useChatLayout();

    useEffect(() => {
        initSocket();
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔥 derive selected conversation
    const selectedConversation = conversations.find(
        (c) => c._id === activeConversationId
    );

    return (
        // h-app is 100dvh with a 100vh fallback: on phones the old h-screen
        // measured the viewport as if the URL bar were hidden, so the composer
        // sat below the fold and the keyboard pushed it further out of reach.
        <div className="h-app w-full flex overflow-hidden bg-surface-base">
            <ConversationNav />

            <div
                className={`
                    ${roomOpenOnMobile ? "hidden" : "flex"} md:flex
                    w-full md:w-[300px] lg:w-[340px] xl:w-[368px]
                    flex-shrink-0 flex-col min-h-0
                    bg-surface-panel border-r border-surface-border
                `}
            >
                <ConversationList />
            </div>

            <div
                className={`
                    ${roomOpenOnMobile ? "flex" : "hidden"} md:flex
                    flex-1 min-w-0 flex-col
                `}
            >
                <ConversationRoom conversation={selectedConversation} />
            </div>
        </div>
    );
};

const Conversation = () => (
    <ChatLayoutProvider>
        <ChatShell />
    </ChatLayoutProvider>
);

export default Conversation;
