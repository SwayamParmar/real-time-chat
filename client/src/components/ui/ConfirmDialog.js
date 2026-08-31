import Modal from "./Modal";

/* ─────────────────────────────────────────────────────────────
   Confirmation prompt for an action that cannot be undone.

   Wraps the shared Modal, so Escape, backdrop dismissal, focus
   handling and the mobile bottom-sheet layout all come for free.
───────────────────────────────────────────────────────────── */

const ConfirmDialog = ({
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    busy = false,
    onConfirm,
    onClose,
}) => (
    <Modal
        title={title}
        onClose={onClose}
        footer={
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 h-10 rounded-xl text-[13.5px] font-medium
                               text-chat-secondary bg-surface-raised
                               hover:bg-surface-muted transition-colors duration-150"
                >
                    {cancelLabel}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={busy}
                    className={`px-4 h-10 rounded-xl text-[13.5px] font-semibold text-white
                                disabled:opacity-60 transition-colors duration-150
                                ${destructive
                            ? "bg-danger hover:brightness-110"
                            : "bg-brand hover:bg-brand-dark"
                        }`}
                >
                    {confirmLabel}
                </button>
            </div>
        }
    >
        <p className="px-4 sm:px-5 pb-4 m-0 text-[13.5px] leading-relaxed text-chat-muted">
            {description}
        </p>
    </Modal>
);

export default ConfirmDialog;
