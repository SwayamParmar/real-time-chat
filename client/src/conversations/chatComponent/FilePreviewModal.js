// FilePreviewModal.jsx
import { useRef, useState, useCallback, useEffect } from "react";
import { FiX, FiSend, FiSmile, FiPaperclip, FiPlus, FiUploadCloud } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import config from "../../config";
import { useAuthStore } from "../../store/authStore";

const FilePreviewModal = ({ files, onClose, onSend }) => {
    const { token } = useAuthStore();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const addMoreRef = useRef(null);
    const [allFiles, setAllFiles] = useState(
        Array.isArray(files)
            ? files.filter(f => f instanceof File)  // ✅ ensure valid File objects only
            : []
    );
    const [previewUrl, setPreviewUrl] = useState(null);
    const dragCounter = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const currentFile = allFiles[selectedIndex];
    const isImage = currentFile?.type?.startsWith("image/");
    const isVideo = currentFile?.type?.startsWith("video/");

    useEffect(() => {
        if (!currentFile) return;
        const url = URL.createObjectURL(currentFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [currentFile]);

    const handleAddMore = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length) {
            setAllFiles((prev) => {
                const existing = new Set(prev.map(f => f.name + f.size));
                const filtered = newFiles.filter(f => !existing.has(f.name + f.size));
                return [...prev, ...filtered];
            });
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
    }, [allFiles]);
    useEffect(() => {
        setSelectedIndex(0);
    }, [files]);

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

        const files = Array.from(e.dataTransfer.files);
        if (files.length) {
            setAllFiles((prev) => {
                const existing = new Set(prev.map(f => f.name + f.size));
                const filtered = files.filter(f => !existing.has(f.name + f.size));
                return [...prev, ...filtered];
            });
        }
    };

    const handleSend = async () => {
        setUploading(true);
        try {
            const uploaded = await Promise.all(
                allFiles.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch(`${config.API_BASE_URL}/upload`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    return await res.json();
                })
            );

            uploaded.forEach((fileData, i) => {
                onSend({
                    content: i === 0 ? caption : "",
                    messageType: fileData.type === "raw" ? "file" : fileData.type,
                    file: { url: fileData.url, name: fileData.name, size: fileData.size },
                });
            });

            onClose();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        // ✅ absolute — stays inside chat room div only
        <div className="absolute inset-0 z-50 flex flex-col bg-surface-base/95 backdrop-blur-md rounded-none"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >

            {isDragging && (
                <div className="absolute inset-0 z-[60] border-2 border-dashed border-brand 
                    rounded-xl flex flex-col items-center justify-center gap-3
                    pointer-events-none backdrop-blur-[10px]">
                    <FiUploadCloud size={48} className="text-brand" />
                    <p className="text-brand font-semibold text-lg">Drop to send</p>
                </div>
            )}

            <div className="flex items-center justify-between px-4 py-3
                            border-b border-surface-muted">
                <button
                    onClick={onClose}
                    className="text-chat-faint hover:text-white transition-colors p-1"
                >
                    <FiX size={20} />
                </button>
                <span className="text-chat-secondary text-sm font-medium truncate max-w-[60%] mx-auto">
                    {currentFile?.name}
                </span>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                {isImage && (
                    <img
                        src={previewUrl}
                        alt={currentFile?.name}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
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
                    <div className="flex flex-col items-center gap-4
                                    bg-surface-panel rounded-2xl p-10
                                    border border-surface-muted">
                        <FaFileAlt size={56} className="text-purple-400" />
                        <div className="text-center">
                            <p className="text-chat-secondary font-semibold text-lg">
                                {currentFile?.name}
                            </p>
                            <p className="text-chat-faint text-sm mt-1">
                                {(currentFile?.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Thumbnail strip with remove buttons */}
            <div className="flex items-center w-full max-w-full gap-2 px-4 py-2 z-50 overflow-x-auto scrollbar-thin scrollbar-thumb-surface-muted">
                {allFiles.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    const isImg = file.type?.startsWith("image/");
                    return (
                        <div key={i} className="relative flex-shrink-0 z-50">
                            <button
                                onClick={() => setSelectedIndex(i)}
                                className={`w-14 h-14 rounded-xl overflow-hidden
                                            border-2 transition-all block ${selectedIndex === i
                                        ? "border-brand"
                                        : "border-white/20 opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {isImg ? (
                                    <img src={url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-surface-panel
                                                    flex items-center justify-center">
                                        <FaFileAlt size={20} className="text-purple-400" />
                                    </div>
                                )}
                            </button>

                            {/* ✅ Remove button on thumbnail */}
                            <button
                                onClick={() => handleRemove(i)}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4
                                           bg-red-500 rounded-full flex items-center
                                           justify-center hover:bg-red-600 transition-colors
                                           z-10"
                            >
                                <FiX size={9} className="text-white" />
                            </button>
                        </div>
                    );
                })}

                {/* Add more */}
                <button
                    onClick={() => addMoreRef.current?.click()}
                    className="w-14 h-14 rounded-xl border-2 border-dashed
                               border-white/20 flex items-center justify-center
                               hover:border-brand hover:text-brand text-white/30
                               transition-all flex-shrink-0"
                >
                    <FiPlus size={20} />
                </button>
                <input
                    ref={addMoreRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleAddMore}
                />
            </div>

            {/* Caption bar */}
            <div className="flex items-center gap-2 px-4 py-3
                            border-t border-surface-muted">
                <FiSmile className="text-chat-faint" />
                <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Add a caption..."
                    className="flex-1 bg-surface-raised border border-surface-muted
                               text-chat-primary placeholder-chat-faint
                               rounded-xl py-2.5 px-4 text-sm outline-none
                               focus:border-brand transition-colors"
                />
                <button
                    onClick={handleSend}
                    disabled={uploading}
                    className="bg-brand text-white p-2 rounded-xl
                               hover:opacity-90 disabled:opacity-50"
                >
                    <FiSend size={16} />
                </button>
            </div>
        </div>
    );
};
export default FilePreviewModal;