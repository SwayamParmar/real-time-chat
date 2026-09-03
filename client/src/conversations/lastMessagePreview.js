import { HiMiniPhoto, HiVideoCamera, HiDocument } from "react-icons/hi2";

/* ─────────────────────────────────────────────────────────────
   How a last message is summarised in the conversation list.
───────────────────────────────────────────────────────────── */

/**
 * @returns {{ icon: import('react').ComponentType | null, text: string }}
 */
export const lastMessagePreview = (message) => {
    // A conversation that was just started, or whose only message was deleted.
    if (!message) return { icon: null, text: "No messages" };

    switch (message.messageType) {
        case "image":
            return { icon: HiMiniPhoto, text: "Photo" };
        case "video":
            return { icon: HiVideoCamera, text: "Video" };
        case "file":
            return { icon: HiDocument, text: message.file?.name || "File" };
        default:
            return { icon: null, text: message.content || "" };
    }
};
