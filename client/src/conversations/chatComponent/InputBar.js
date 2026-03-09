import { useState } from "react";
import {
    FiSmile,
    FiPaperclip,
    FiMic,
    FiSend,
} from "react-icons/fi";
import { useRef } from "react";
import { useChatStore } from "../../store/chatStore";

const InputBar = ({ onSend }) => {
    const { emitTyping, emitStopTyping, activeConversationId } = useChatStore();
    const typingTimeoutRef = useRef(null);
    const [value, setValue] = useState("");

    const handleInputChange = (e) => {
        setValue(e.target.value);
        emitTyping(activeConversationId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(activeConversationId);
        }, 2000);
    };

    const handleSend = () => {
        if (!value.trim()) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        emitStopTyping(activeConversationId);
        onSend(value.trim());
        setValue("");
    };

    return (
        <div className="px-4 py-3.5 bg-surface-panel border-t border-surface-border flex items-center gap-2">
            <FiSmile className="text-chat-faint" />
            <input
                value={value}
                onChange={(e) => handleInputChange(e)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Your message..."
                className="flex-1 bg-surface-raised border text-chat-primary border-surface-muted rounded-xl py-2.5 px-4 text-sm"
            />
            <FiPaperclip className="text-chat-faint" />
            <FiMic className="text-chat-faint" />
            <button onClick={handleSend} className="bg-brand text-white p-2 rounded-xl">
                <FiSend />
            </button>
        </div>
    );
};
export default InputBar