import { useState, useRef, useEffect } from "react";
import { FiSmile, FiPaperclip, FiMic, FiSend, FiX } from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";

const InputBar = ({ onSend }) => {
    const {
        emitTyping,
        emitStopTyping,
        activeConversationId,
        editingMessage,
        clearEditingMessage,
        emitEditMessage,
    } = useChatStore();

    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const [value, setValue] = useState("");

    // ✅ Pre-fill input when edit mode is triggered
    useEffect(() => {
        if (editingMessage) {
            setValue(editingMessage.content);
            inputRef.current?.focus();
        } else {
            setValue("");
        }
    }, [editingMessage]);

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

        if (editingMessage) {
            // ✅ Edit mode — emit edit
            emitEditMessage({ messageId: editingMessage._id, content: value.trim() });
            clearEditingMessage();
        } else {
            // ✅ Normal send
            onSend(value.trim());
        }
        setValue("");
    };

    const handleCancelEdit = () => {
        clearEditingMessage();
        setValue("");
    };

    return (
        <div className="px-4 py-3.5 bg-surface-panel border-t border-surface-border flex flex-col gap-2">
            {/* ✅ Edit mode banner */}
            {editingMessage && (
                <div className="flex items-center justify-between bg-surface-raised 
                                px-3 py-1.5 rounded-lg text-xs text-chat-faint">
                    <span>
                        Editing: <span className="text-chat-secondary font-medium">
                            {editingMessage.content}
                        </span>
                    </span>
                    <button onClick={handleCancelEdit}>
                        <FiX className="text-chat-faint hover:text-red-400" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <FiSmile className="text-chat-faint" />
                <input
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={editingMessage ? "Edit message..." : "Your message..."}
                    className="flex-1 bg-surface-raised border text-chat-primary 
                               border-surface-muted rounded-xl py-2.5 px-4 text-sm"
                />
                <FiPaperclip className="text-chat-faint" />
                <FiMic className="text-chat-faint" />
                <button
                    onClick={handleSend}
                    className="bg-brand text-white p-2 rounded-xl"
                >
                    <FiSend />
                </button>
            </div>
        </div>
    );
};

export default InputBar;