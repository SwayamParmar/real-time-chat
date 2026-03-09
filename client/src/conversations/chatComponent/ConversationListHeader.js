import { useState } from "react";
import StartConversation from "./StartConversation";

const ConversationListHeader = () => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    return (
        <>
            <div className="px-5 pt-5 pb-3 border-b border-surface-border">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-chat-primary font-bold text-lg tracking-tight">
                        Messages
                    </span>
                    <button
                        onClick={() => setShowModal(true)}
                        title="New conversation"
                        className="w-8 h-8 bg-surface-border rounded-lg flex items-center justify-center text-brand text-lg hover:bg-surface-muted transition-colors duration-200"
                    >
                        +
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-chat-faint text-sm pointer-events-none">
                        ⌕
                    </span>
                    <input
                        // value={search}
                        // onChange={e => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full bg-surface-raised border border-surface-muted rounded-[10px] py-2 pl-8 pr-3 text-chat-muted text-[13px] font-sans placeholder:text-chat-faint focus:border-brand-muted transition-colors duration-200"
                    />
                </div>
            </div>
            {
                showModal && (
                    <StartConversation
                        onClose={() => setShowModal(false)}
                        closePopup={() => setShowModal(false)}
                    />
                )
            }
        </>
    );

};


export default ConversationListHeader;