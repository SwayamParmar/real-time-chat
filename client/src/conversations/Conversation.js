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
        closeConversation,
    } = useChatStore();

    const { roomOpenOnMobile, closeRoom } = useChatLayout();

    useEffect(() => {
        initSocket();
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
     * Escape closes the open conversation, on every screen size — but "close"
     * means two different things:
     *
     *   below md  the room is a pane stacked over the list, so Escape backs
     *             out to the list and deliberately leaves the conversation
     *             loaded, exactly like the header's back arrow
     *   md and up both panes are always visible, so there is nothing to back
     *             out to — Escape deselects instead, which is the only thing
     *             closing can mean there
     *
     * The earlier version bound this only while the room pane was open on a
     * phone, which is why it did nothing on desktop.
     *
     * Deferred to whatever is layered on top: a dialog, an open menu, or an
     * edit in progress all own Escape first and handle it themselves.
     */
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            if (useChatStore.getState().editingMessage) return;
            if (document.querySelector('[role="dialog"], [role="menu"]')) return;

            // Read at keypress time — nothing here needs to re-render when the
            // viewport crosses the breakpoint.
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
