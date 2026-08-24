import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiUserX } from "react-icons/fi";
import debounce from "lodash.debounce";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useChatLayout } from "../ChatLayoutContext";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { ConversationSkeleton } from "../../components/ui/Skeleton";
import { Avatar } from "../chatUtils";

/* ─────────────────────────────────────────────────────────────
   "New conversation" picker.

   Selection logic is untouched: it still reuses an existing
   conversation when there is one, otherwise calls
   startConversation, then fetchMessages.

   The chrome around it was a white card in a dark app, pinned to
   a fixed 400px width (so it overflowed every phone), with a
   Cancel button wired to a prop that was never passed. It now
   uses the shared Modal, which docks to the bottom as a sheet on
   phones and brings Escape, backdrop dismissal, focus handling
   and dialog semantics with it.
───────────────────────────────────────────────────────────── */

/*
 * The list scrolls once it passes seven people, on phones and desktop alike.
 * The row height is fixed so that cut-off lands on a row boundary rather than
 * mid-row: 40px avatar + 2 × 10px vertical padding.
 */
const MAX_VISIBLE_USERS = 7;
const USER_ROW_HEIGHT = 60;

const StartConversation = ({ onClose }) => {
    const {
        users,
        conversations,
        fetchUsers,
        startConversation,
        fetchMessages,
        loadingUsers,
    } = useChatStore();

    const { user: currentUser } = useAuthStore();
    const { openRoom } = useChatLayout();

    const [searchTerm, setSearchTerm] = useState("");
    const [pendingId, setPendingId] = useState(null);

    // 🔥 Debounced search
    const debouncedSearch = useMemo(
        () =>
            debounce((term) => {
                setSearchTerm(term);
            }, 400),
        []
    );

    // Cancel any in-flight debounce on unmount, so a trailing call cannot
    // set state on a dialog that has already closed.
    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = users
        .filter((u) => u._id !== currentUser.id) // exclude self
        .filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleStartConversation = async (selectedUser) => {
        if (pendingId) return;
        setPendingId(selectedUser._id);

        // 🔥 Check if conversation already exists
        const existingConversation = conversations.find((conv) =>
            conv.participants.some(
                (p) => p._id === selectedUser._id
            )
        );

        let conversationToOpen;

        if (existingConversation) {
            conversationToOpen = existingConversation;
        } else {
            conversationToOpen = await startConversation(selectedUser._id);
        }

        if (conversationToOpen) {
            await fetchMessages(conversationToOpen._id);
            openRoom();
            onClose?.();
            return;
        }

        setPendingId(null);
    };

    return (
        <Modal
            title="New conversation"
            description="Pick someone to start chatting with."
            onClose={onClose}
        >
            <div className="px-4 sm:px-5 pb-2">
                <div className="relative">
                    <label htmlFor="user-search" className="sr-only">
                        Search users
                    </label>
                    <FiSearch
                        aria-hidden="true"
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-faint pointer-events-none"
                    />
                    <input
                        id="user-search"
                        type="search"
                        placeholder="Search people"
                        autoComplete="off"
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="w-full h-11 bg-surface-raised border border-surface-border
                                   rounded-xl pl-9 pr-3 text-chat-primary text-[15px]
                                   placeholder:text-chat-faint
                                   hover:border-surface-muted
                                   focus:border-brand-subtle
                                   outline-none transition-colors duration-150
                                   [&::-webkit-search-cancel-button]:hidden"
                    />
                </div>
            </div>

            {loadingUsers ? (
                <ConversationSkeleton rows={5} />
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    compact
                    icon={FiUserX}
                    title="No people found"
                    description={
                        searchTerm
                            ? "Try a different name."
                            : "There is nobody else here yet."
                    }
                />
            ) : (
                <ul
                    className="list-none m-0 p-0 overflow-y-auto scroll-contain"
                    style={{ maxHeight: MAX_VISIBLE_USERS * USER_ROW_HEIGHT }}
                >
                    {filteredUsers.map((u) => (
                        <li key={u._id}>
                            <button
                                type="button"
                                onClick={() => handleStartConversation(u)}
                                disabled={Boolean(pendingId)}
                                style={{ height: USER_ROW_HEIGHT }}
                                className="w-full flex items-center gap-3 px-4 sm:px-5 text-left
                                           hover:bg-surface-raised active:bg-surface-muted
                                           disabled:opacity-50
                                           transition-colors duration-150"
                            >
                                <Avatar name={u.name} id={u._id} size="sm" />
                                <span className="flex-1 min-w-0 text-chat-secondary text-[14px] sm:text-[15px] font-medium truncate">
                                    {u.name}
                                </span>
                                {pendingId === u._id && (
                                    <span
                                        role="status"
                                        aria-label="Opening conversation"
                                        className="w-4 h-4 flex-shrink-0 rounded-full animate-spin
                                                   border-2 border-brand border-t-transparent"
                                    />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
};

export default StartConversation;
