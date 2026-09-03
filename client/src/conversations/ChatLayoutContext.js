import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Which pane the phone is showing.

   Going "back" to the list does not clear the active
   conversation, so the room stays mounted and joined. Ignored
   above md, where both panes are always visible.
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
