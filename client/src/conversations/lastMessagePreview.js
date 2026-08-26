import { HiMiniPhoto, HiVideoCamera, HiDocument } from "react-icons/hi2";

/* ─────────────────────────────────────────────────────────────
   One place that decides how a last message is summarised in the
   conversation list.

   The same four-deep nested ternary used to appear twice in
   ConversationList — once to build a title attribute and again,
   character for character, to build the visible row.
───────────────────────────────────────────────────────────── */

/**
 * @returns {{ icon: import('react').ComponentType | null, text: string }}
 */
export const lastMessagePreview = (message) => {
    // No message at all: a conversation that was just started, or one whose
    // only message has since been deleted. Both used to render a blank line.
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
