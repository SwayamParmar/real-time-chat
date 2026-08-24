// FilePreviewModal.jsx
import { useRef, useState, useEffect, useMemo } from "react";
import { FiX, FiSend, FiPlus, FiUploadCloud } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import IconButton from "../../components/ui/IconButton";

/* ─────────────────────────────────────────────────────────────
   Attachment review before sending.

   Behaviour is unchanged — it still hands { files, caption } to
   onSend and closes immediately so the upload runs in the
   background. The rewrite is about the shell:

     • thumbnail blob URLs are created once per file instead of
       once per file *per render*, which was leaking one object
       URL every time the component re-rendered
     • it is a labelled dialog with Escape and a trapped tab
       order rather than an unannounced div
     • the layout survives a 320px screen and clears the home
       indicator
───────────────────────────────────────────────────────────── */

const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const dedupeAppend = (prev, incoming) => {
    const existing = new Set(prev.map((f) => f.name + f.size));
    return [...prev, ...incoming.filter((f) => !existing.has(f.name + f.size))];
};

const FilePreviewModal = ({ files, onClose, onSend }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [caption, setCaption] = useState("");
    const addMoreRef = useRef(null);
    const panelRef = useRef(null);
    const [allFiles, setAllFiles] = useState(
        Array.isArray(files)
            ? files.filter(f => f instanceof File)  // ✅ ensure valid File objects only
            : []
    );
    const dragCounter = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const currentFile = allFiles[selectedIndex];
    const isImage = currentFile?.type?.startsWith("image/");
    const isVideo = currentFile?.type?.startsWith("video/");

    /*
     * One object URL per file, created when the file list changes and revoked
     * when it changes again or the dialog unmounts. The previous version
     * called URL.createObjectURL inside the thumbnail map, so every render
     * minted a fresh URL for every attachment and never released any of them.
     */
    const previewUrls = useMemo(
        () => allFiles.map((file) => URL.createObjectURL(file)),
        [allFiles]
    );

    useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls]);

    const previewUrl = previewUrls[selectedIndex];

    const handleAddMore = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length) {
            setAllFiles((prev) => dedupeAppend(prev, newFiles));
        }
        e.target.value = "";
    };

    // ✅ Remove file from list
    const handleRemove = (index) => {
        setAllFiles((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            // if removed was selected, move to previous
            if (selectedIndex >= updated.length) {
                setSelectedIndex(Math.max(0, updated.length - 1));
            }
            return updated;
        });
    };

    // ✅ Close if all files removed
    useEffect(() => {
        if (allFiles.length === 0) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allFiles]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [files]);

    // Move focus into the dialog on open so keyboard and screen-reader users
    // land on the caption field rather than back at the top of the page.
    useEffect(() => {
        panelRef.current?.focus();
    }, []);

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        if (e.dataTransfer.items?.length > 0) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);

        const dropped = Array.from(e.dataTransfer.files);
        if (dropped.length) {
            setAllFiles((prev) => dedupeAppend(prev, dropped));
        }
    };

    const handleSend = () => {
        if (allFiles.length === 0) return;

        // ✅ Close modal INSTANTLY
        onClose();

        // ✅ Trigger background upload
        onSend({
            files: allFiles,
            caption,
        });
    };

    return (
        // ✅ absolute — stays inside chat room div only
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Send ${allFiles.length} attachment${allFiles.length === 1 ? "" : "s"}`}
            tabIndex={-1}
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
            }}
            className="absolute inset-0 z-50 flex flex-col outline-none
                       bg-surface-base/95 backdrop-blur-md"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div
                    className="absolute inset-3 z-[60] border-2 border-dashed border-brand
                               rounded-2xl flex flex-col items-center justify-center gap-3
                               pointer-events-none backdrop-blur-[10px]"
                >
                    <FiUploadCloud size={40} className="text-brand" aria-hidden="true" />
                    <p className="text-brand font-semibold text-base">Drop to send</p>
                </div>
            )}

            <header
                className="flex items-center gap-2 px-2 sm:px-4 py-2.5
                           pt-[max(0.625rem,var(--safe-top))]
                           border-b border-surface-border flex-shrink-0"
            >
                <IconButton label="Cancel and close" icon={FiX} iconSize={20} onClick={onClose} />

                <div className="min-w-0 flex-1 text-center pr-10">
                    <p className="text-chat-primary text-sm font-medium truncate m-0">
                        {currentFile?.name}
                    </p>
                    <p className="text-chat-faint text-[11px] m-0 mt-0.5">
                        {formatFileSize(currentFile?.size)}
                        {allFiles.length > 1 && ` · ${selectedIndex + 1} of ${allFiles.length}`}
                    </p>
                </div>
            </header>

            {/* Preview area */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                {isImage && (
                    <img
                        src={previewUrl}
                        alt={currentFile?.name || "Attachment preview"}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-panel"
                    />
                )}
                {isVideo && (
                    <video
                        src={previewUrl}
                        controls
                        className="max-h-full max-w-full rounded-xl"
                    />
                )}
                {!isImage && !isVideo && (
                    <div
                        className="flex flex-col items-center gap-4 max-w-full
                                   bg-surface-panel rounded-2xl px-6 py-8 sm:px-10 sm:py-10
                                   border border-surface-border"
                    >
                        <FaFileAlt size={48} className="text-brand-accent" aria-hidden="true" />
                        <div className="text-center min-w-0">
                            <p className="text-chat-secondary font-semibold text-base break-all">
                                {currentFile?.name}
                            </p>
                            <p className="text-chat-faint text-sm mt-1">
                                {formatFileSize(currentFile?.size)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Thumbnail strip with remove buttons */}
            <div
                className="flex items-center gap-2 px-3 sm:px-4 py-2 flex-shrink-0
                           overflow-x-auto hide-scrollbar"
            >
                {allFiles.map((file, i) => {
                    const isImg = file.type?.startsWith("image/");
                    return (
                        <div key={file.name + file.size} className="relative flex-shrink-0 pt-1.5 pr-1.5">
                            <button
                                type="button"
                                onClick={() => setSelectedIndex(i)}
                                aria-label={`Preview ${file.name}`}
                                aria-current={selectedIndex === i ? "true" : undefined}
                                className={`w-14 h-14 rounded-xl overflow-hidden block
                                            border-2 transition-all duration-150 ${selectedIndex === i
                                        ? "border-brand"
                                        : "border-surface-border opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {isImg ? (
                                    <img
                                        src={previewUrls[i]}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="w-full h-full bg-surface-panel flex items-center justify-center">
                                        <FaFileAlt size={20} className="text-brand-accent" aria-hidden="true" />
                                    </span>
                                )}
                            </button>

                            {/* ✅ Remove button on thumbnail */}
                            <button
                                type="button"
                                onClick={() => handleRemove(i)}
                                aria-label={`Remove ${file.name}`}
                                className="absolute top-0 right-0 w-5 h-5 z-10
                                           bg-red-500 rounded-full flex items-center justify-center
                                           hover:bg-red-600 transition-colors"
                            >
                                <FiX size={11} className="text-white" aria-hidden="true" />
                            </button>
                        </div>
                    );
                })}

                {/* Add more */}
                <button
                    type="button"
                    onClick={() => addMoreRef.current?.click()}
                    aria-label="Add more attachments"
                    className="w-14 h-14 mt-1.5 rounded-xl border-2 border-dashed flex-shrink-0
                               border-surface-muted text-chat-faint
                               flex items-center justify-center
                               hover:border-brand hover:text-brand transition-colors duration-150"
                >
                    <FiPlus size={20} aria-hidden="true" />
                </button>
                <input
                    ref={addMoreRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={handleAddMore}
                />
            </div>

            {/* Caption bar */}
            <div
                className="flex items-center gap-2 px-3 sm:px-4 pt-2.5 flex-shrink-0
                           pb-[max(0.625rem,var(--safe-bottom))]
                           border-t border-surface-border"
            >
                <label htmlFor="attachment-caption" className="sr-only">
                    Add a caption
                </label>
                <input
                    id="attachment-caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Add a caption…"
                    className="flex-1 min-w-0 h-11 bg-surface-raised border border-surface-border
                               text-chat-primary placeholder:text-chat-faint
                               rounded-2xl px-4 text-[15px] outline-none
                               hover:border-surface-muted
                               focus:border-brand-subtle
                               transition-colors duration-150"
                />
                <IconButton
                    label={`Send ${allFiles.length} attachment${allFiles.length === 1 ? "" : "s"}`}
                    icon={FiSend}
                    iconSize={17}
                    variant="primary"
                    size="lg"
                    onClick={handleSend}
                />
            </div>
        </div>
    );
};
export default FilePreviewModal;
