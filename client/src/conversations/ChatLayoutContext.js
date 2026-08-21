import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Which pane the phone is showing.

   This is purely presentational and deliberately separate from
   the chat store: opening a conversation still goes through
   fetchMessages / activeConversationId exactly as before, and
   going "back" to the list does NOT clear the active
   conversation — the room stays mounted and joined, so the
   socket room membership, the loaded page and the scroll
   position all survive the trip, the same way a native
   messaging app behaves.

   Above the md breakpoint the value is ignored: both panes are
   always visible and this state has no effect.
───────────────────────────────────────────────────────────── */

const ChatLayoutContext = createContext(null);

export const ChatLayoutProvider = ({ children }) => {
    const [roomOpenOnMobile, setRoomOpenOnMobile] = useState(false);

    const openRoom = useCallback(() => setRoomOpenOnMobile(true), []);
    const closeRoom = useCallback(() => setRoomOpenOnMobile(false), []);

    const value = useMemo(
        () => ({ roomOpenOnMobile, openRoom, closeRoom }),
        [roomOpenOnMobile, openRoom, closeRoom]
    );

    return <ChatLayoutContext.Provider value={value}>{children}</ChatLayoutContext.Provider>;
};

export const useChatLayout = () => {
    const ctx = useContext(ChatLayoutContext);
    if (!ctx) {
        throw new Error("useChatLayout must be used inside <ChatLayoutProvider>");
    }
    return ctx;
};
