import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { FiPaperclip, FiSend, FiX, FiFileText, FiImage, FiCamera } from "react-icons/fi";
import { useChatStore } from "../../store/chatStore";
import IconButton from "../../components/ui/IconButton";

/* ─────────────────────────────────────────────────────────────
   Message composer.

   Typing / edit / send behaviour is untouched: the same store
   actions fire on the same events, Enter still sends. What
   changed is the shell around them — a textarea that grows with
   the message instead of a one-line input, real buttons instead
   of bare <svg onClick>, and padding that clears the home
   indicator when the keyboard is up.
───────────────────────────────────────────────────────────── */

const ATTACHMENT_OPTIONS = [
    {
        label: "Document",
        icon: FiFileText,
        color: "bg-violet-500",
        accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
    },
    {
        label: "Photo & Video",
        icon: FiImage,
        color: "bg-sky-500",
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

// Roughly six lines of text before the composer stops growing and scrolls.
const MAX_COMPOSER_HEIGHT = 148;

// ✅ Attachment menu — a popover on desktop, a bottom sheet on phones
const AttachmentMenu = ({ onFileSelect }) => {
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
        <>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={activeAccept}
                capture={activeCapture}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                    const file = e.target.files?.[0]; // single file
                    if (file) onFileSelect(file);     // passes File object ✅
                    e.target.value = "";
                }}
            />

            <div
                role="menu"
                aria-label="Attach"
                className="
                    z-30
                    fixed inset-x-2 bottom-[calc(0.5rem+var(--safe-bottom))] animate-sheet-up
                    sm:absolute sm:inset-x-auto sm:bottom-12 sm:left-0 sm:w-56 sm:animate-pop-in sm:origin-bottom-left
                    bg-surface-panel border border-surface-border rounded-2xl shadow-panel
                    p-1.5 flex flex-col gap-0.5
                "
            >
                {ATTACHMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.label}
                            type="button"
                            role="menuitem"
                            onClick={() => handleOptionClick(option)}
                            className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl w-full text-left
                                       hover:bg-surface-raised active:bg-surface-muted
                                       transition-colors duration-150 group"
                        >
                            <span
                                aria-hidden="true"
                                className={`${option.color} w-9 h-9 rounded-full flex-shrink-0
                                            flex items-center justify-center shadow-sm
                                            group-hover:scale-105 transition-transform duration-150`}
                            >
                                <Icon size={17} className="text-white" />
                            </span>
                            <span className="text-chat-secondary text-sm font-medium">
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
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

    // ✅ Close on outside click / Escape
    useEffect(() => {
        if (!showAttachment) return undefined;

        const onPointerDown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowAttachment(false);
            }
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setShowAttachment(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [showAttachment]);

    // ✅ Pre-fill input when edit mode is triggered
    useEffect(() => {
        if (editingMessage) {
            setValue(editingMessage.content);
            inputRef.current?.focus();
        } else {
            setValue("");
        }
    }, [editingMessage]);

    // Auto-size the textarea to its content, before paint, so the composer
    // never flashes at the wrong height as a message wraps onto a new line.
    useLayoutEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT)}px`;
    }, [value]);

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

        /*
         * Keep the composer focused so the on-screen keyboard stays up for the
         * next message, the way a native messaging app behaves. Emptying the
         * field flips the send button to disabled, and a browser blurs a
         * newly-disabled element — which closed the keyboard mid-conversation.
         */
        inputRef.current?.focus();
    };

    const handleKeyDown = useCallback(
        (e) => {
            // Enter sends, as it always has. Shift+Enter is the escape hatch
            // for a deliberate newline, which the old single-line input
            // could not express at all.
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
            if (e.key === "Escape" && editingMessage) {
                handleCancelEdit();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value, editingMessage]
    );

    const handleCancelEdit = () => {
        clearEditingMessage();
        setValue("");
    };

    const handleFileSelect = (file) => {
        setShowAttachment(false);
        onFileSelect?.([file]); // ✅ wrap in array — ConversationRoom expects array
    };

    const canSend = value.trim().length > 0;

    return (
        <div
            className="flex-shrink-0 bg-surface-panel border-t border-surface-border
                       px-2 sm:px-4 pt-2.5
                       pb-[max(0.625rem,var(--safe-bottom))]
                       flex flex-col gap-2 relative"
        >
            {/* ✅ Edit mode banner */}
            {editingMessage && (
                <div
                    className="flex items-center gap-2 bg-surface-raised border-l-2 border-brand
                               pl-3 pr-1.5 py-1.5 rounded-lg text-xs text-chat-faint animate-fade-in"
                >
                    <span className="flex-1 min-w-0 truncate">
                        Editing:{" "}
                        <span className="text-chat-secondary font-medium">
                            {editingMessage.content}
                        </span>
                    </span>
                    <IconButton
                        label="Cancel editing"
                        icon={FiX}
                        iconSize={15}
                        size="sm"
                        variant="danger"
                        onClick={handleCancelEdit}
                    />
                </div>
            )}

            <div className="flex items-end gap-1.5 sm:gap-2">
                {/* ✅ Attach */}
                <div ref={dropdownRef} className="relative flex-shrink-0">
                    <IconButton
                        label={showAttachment ? "Close attachment menu" : "Attach a file"}
                        icon={FiPaperclip}
                        variant={showAttachment ? "active" : "ghost"}
                        aria-expanded={showAttachment}
                        aria-haspopup="menu"
                        onClick={() => setShowAttachment((p) => !p)}
                    />

                    {showAttachment && <AttachmentMenu onFileSelect={handleFileSelect} />}
                </div>

                <label htmlFor="composer" className="sr-only">
                    {editingMessage ? "Edit message" : "Write a message"}
                </label>
                <textarea
                    id="composer"
                    ref={inputRef}
                    rows={1}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={editingMessage ? "Edit message…" : "Write a message…"}
                    className="flex-1 min-w-0 resize-none min-h-[44px]
                               bg-surface-raised border border-surface-border
                               text-chat-primary placeholder:text-chat-faint
                               rounded-2xl py-2.5 px-3.5 text-[15px] leading-[1.4]
                               max-h-[148px] overflow-y-auto scroll-contain
                               hover:border-surface-muted
                               focus:border-brand-subtle
                               outline-none transition-colors duration-150"
                />

                <IconButton
                    label={editingMessage ? "Save edit" : "Send message"}
                    icon={FiSend}
                    iconSize={17}
                    variant="primary"
                    size="lg"
                    disabled={!canSend}
                    onClick={handleSend}
                    // Suppressing the default mousedown stops the button from
                    // taking focus off the textarea. On touch that is what
                    // dismissed the keyboard the instant a message was sent.
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex-shrink-0"
                />
            </div>
        </div>
    );
};

export default InputBar;
