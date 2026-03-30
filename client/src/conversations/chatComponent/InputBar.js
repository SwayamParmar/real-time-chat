import { useState, useRef, useEffect } from "react";
import { FiSmile, FiPaperclip, FiMic, FiSend, FiX, FiFileText, FiImage, FiCamera } from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";

const attachmentOptions = [
    {
        label: "Document",
        icon: FiFileText,
        color: "bg-purple-500",
        accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
    },
    {
        label: "Photo & Video",
        icon: FiImage,
        color: "bg-blue-500",
        accept: "image/*,video/*",
    },
    {
        label: "Camera",
        icon: FiCamera,
        color: "bg-pink-500",
        accept: "image/*",
        capture: "environment",
    },
];

// ✅ Attachment Dropdown — fixed positioning + smaller icons
const AttachmentDropdown = ({ onFileSelect }) => {
    const fileInputRef = useRef(null);
    const [activeAccept, setActiveAccept] = useState("");
    const [activeCapture, setActiveCapture] = useState(null);

    const handleOptionClick = (option) => {
        setActiveAccept(option.accept);
        setActiveCapture(option.capture || null);
        // disable multiple for camera
        if (fileInputRef.current) {
            fileInputRef.current.multiple = !option.capture;
        }
        setTimeout(() => fileInputRef.current?.click(), 50);
    };

    return (
        // ✅ bottom-10 to sit just above paperclip, right-0 to align with it
        <div className="absolute bottom-14 -left-5 z-30 animate-fade-in">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={activeAccept}
                capture={activeCapture}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]; // single file
                    if (file) onFileSelect(file);     // passes File object ✅
                    e.target.value = "";
                }}
            />

            {/* Dropdown card */}
            <div className="bg-surface-panel border border-surface-muted rounded-xl 
                            shadow-2xl flex flex-col gap-1 min-w-[180px]">
                {attachmentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.label}
                            onClick={() => handleOptionClick(option)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                                       hover:bg-surface-raised transition-all duration-150
                                       group w-full text-left"
                        >
                            {/* ✅ smaller icon circle — match WhatsApp style */}
                            <span className={`${option.color} w-9 h-9 rounded-full 
                                             flex items-center justify-center shadow-sm 
                                             group-hover:scale-105 transition-transform duration-150
                                             flex-shrink-0`}>
                                <Icon size={17} className="text-white" />
                            </span>
                            <span className="text-chat-secondary text-sm font-medium">
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ✅ Arrow pointing DOWN toward paperclip, aligned right */}
            {/* <div className="flex justify-start pr-1.5">
                <div className="w-3 h-3 bg-surface-panel border-r border-b 
                                border-surface-muted rotate-45 -mt-1.5" />
            </div> */}
        </div>
    );
};
const InputBar = ({ onSend, onFileSelect }) => {
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
    const dropdownRef = useRef(null);
    const [value, setValue] = useState("");
    const [showAttachment, setShowAttachment] = useState(false);

    // ✅ Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowAttachment(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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
            emitEditMessage({ messageId: editingMessage._id, content: value.trim() });
            clearEditingMessage();
        } else {
            onSend(value.trim());
        }
        setValue("");
    };

    const handleCancelEdit = () => {
        clearEditingMessage();
        setValue("");
    };

    const handleFileSelect = (file) => {
        setShowAttachment(false);
        onFileSelect?.([file]); // ✅ wrap in array — ConversationRoom expects array
    };

    return (
        <div className="px-4 py-3.5 bg-surface-panel border-t border-surface-border 
                        flex flex-col gap-2 relative">

            {/* ✅ Edit mode banner */}
            {editingMessage && (
                <div className="flex items-center justify-between bg-surface-raised 
                                px-3 py-1.5 rounded-lg text-xs text-chat-faint">
                    <span>
                        Editing:{" "}
                        <span className="text-chat-secondary font-medium">
                            {editingMessage.content}
                        </span>
                    </span>
                    <button onClick={handleCancelEdit}>
                        <FiX className="text-chat-faint hover:text-red-400" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <FiSmile className="text-chat-faint cursor-pointer hover:text-chat-secondary 
                                    transition-colors" />

                {/* ✅ Paperclip with dropdown */}
                <div ref={dropdownRef} className="relative">
                    <FiPaperclip
                        onClick={() => setShowAttachment((p) => !p)}
                        className={`transition-colors cursor-pointer duration-150 ${showAttachment
                            ? "text-brand"
                            : "text-chat-faint hover:text-chat-secondary"
                            }`}
                    />

                    {/* ✅ Dropdown with fade */}
                    {showAttachment && (
                        <AttachmentDropdown onFileSelect={handleFileSelect} />
                    )}
                </div>
                <input
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={editingMessage ? "Edit message..." : "Your message..."}
                    className="flex-1 bg-surface-raised border text-chat-primary 
                               border-surface-muted rounded-xl py-2.5 px-4 text-sm"
                />

                <FiMic className="text-chat-faint cursor-pointer hover:text-chat-secondary 
                                  transition-colors" />

                <button
                    onClick={handleSend}
                    className="bg-brand text-white p-2 rounded-xl hover:opacity-90 
                               transition-opacity"
                >
                    <FiSend />
                </button>
            </div>
        </div>
    );
};

export default InputBar;