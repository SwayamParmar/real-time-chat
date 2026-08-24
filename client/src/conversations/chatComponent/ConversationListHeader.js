import { useId, useRef, useState } from "react";
import { FiEdit, FiSearch, FiX } from "react-icons/fi";
import StartConversation from "./StartConversation";
import IconButton from "../../components/ui/IconButton";
import { LogoMark } from "../../components/TalkStreamLogo";
import ProfileMenu from "./ProfileMenu";

/* ─────────────────────────────────────────────────────────────
   Conversation-list header: brand, new-chat action, search.

   Search is controlled from ConversationList, which owns the
   filtering. Nothing here talks to the store or the network.
───────────────────────────────────────────────────────────── */

const ConversationListHeader = ({ search, onSearchChange }) => {
    const [showModal, setShowModal] = useState(false);
    const searchId = useId();
    const inputRef = useRef(null);

    const handleClear = () => {
        onSearchChange("");
        inputRef.current?.focus();
    };

    return (
        <>
            <div
                className="px-4 pb-3 border-b border-surface-border flex-shrink-0
                           pt-[max(1rem,var(--safe-top))]"
            >
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* The nav rail carries the mark on desktop; on phones
                            the rail is hidden, so the list header carries it. */}
                        <span className="md:hidden flex-shrink-0">
                            <LogoMark className="h-7" />
                        </span>
                        <h1 className="text-chat-primary font-bold text-[15px] sm:text-[17px] tracking-tight m-0 truncate">
                            Messages
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <IconButton
                            label="New conversation"
                            icon={FiEdit}
                            iconSize={16}
                            variant="active"
                            chip
                            onClick={() => setShowModal(true)}
                        />

                        {/* The nav rail carries this on desktop. */}
                        <span className="md:hidden">
                            <ProfileMenu placement="header" />
                        </span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <label htmlFor={searchId} className="sr-only">
                        Search conversations
                    </label>
                    <FiSearch
                        aria-hidden="true"
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-faint pointer-events-none"
                    />
                    <input
                        id={searchId}
                        ref={inputRef}
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search conversations"
                        autoComplete="off"
                        className="w-full h-11 sm:h-10 bg-surface-raised border border-surface-border
                                   rounded-xl pl-9 pr-9 text-chat-primary text-sm
                                   placeholder:text-chat-faint
                                   hover:border-surface-muted
                                   focus:border-brand-subtle
                                   outline-none transition-colors duration-150
                                   [&::-webkit-search-cancel-button]:hidden"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Clear search"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2
                                       w-7 h-7 rounded-lg flex items-center justify-center
                                       text-chat-faint hover:text-chat-primary hover:bg-surface-muted
                                       transition-colors duration-150"
                        >
                            <FiX size={15} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            {showModal && <StartConversation onClose={() => setShowModal(false)} />}
        </>
    );
};

export default ConversationListHeader;
