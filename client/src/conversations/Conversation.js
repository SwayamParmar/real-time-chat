import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";
import ConversationList from "./ConversationList";
import ConversationRoom from "./ConversationRoom";
import ConversationNav from "./ConversationNav";
import { ChatLayoutProvider, useChatLayout } from "./ChatLayoutContext";

/* ─────────────────────────────────────────────────────────────
   Chat shell.

   Desktop (md and up)   [ rail ][ list ][ room ]
   Mobile   (below md)   [ list ]  ⇄  [ room ]

   Both panes stay mounted on mobile and are swapped with
   visibility rather than conditionally rendered, so the room
   keeps its scroll position.
───────────────────────────────────────────────────────────── */

const ChatShell = () => {
    const {
        fetchConversations,
        initSocket,
        conversations,
        activeConversationId,
        closeConversation,
    } = useChatStore();

    const { roomOpenOnMobile, closeRoom } = useChatLayout();

    useEffect(() => {
        initSocket();
        fetchConversations();
        useSettingsStore.getState().fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
     * Escape closes the open conversation:
     *
     *   below md  backs out to the list, leaving it loaded
     *   md and up deselects, since both panes are always visible
     *
     * Deferred to anything layered on top — a dialog, an open menu or an edit
     * in progress handles Escape first.
     */
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            if (useChatStore.getState().editingMessage) return;
            if (document.querySelector('[role="dialog"], [role="menu"]')) return;

            // Read at keypress time, so crossing the breakpoint does not
            // re-render.
            if (window.matchMedia("(min-width: 768px)").matches) {
                closeConversation();
                return;
            }

            if (roomOpenOnMobile) closeRoom();
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [roomOpenOnMobile, closeRoom, closeConversation]);

    // 🔥 derive selected conversation
    const selectedConversation = conversations.find(
        (c) => c._id === activeConversationId
    );

    return (
        // h-app is 100dvh with a 100vh fallback, so the composer stays above
        // the fold on phones.
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
