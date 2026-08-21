import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import EmptyState from "../../components/ui/EmptyState";

/*
 * Desktop-only in practice: below md the room pane is hidden while no
 * conversation is open, so this is what fills the empty right-hand column.
 */
const NoConversationSelected = () => (
    <div className="flex-1 flex items-center justify-center bg-surface-base">
        <EmptyState
            icon={FiMessageSquare}
            title="No conversation selected"
            description="Pick someone from the list to start chatting."
        />
    </div>
);

export default NoConversationSelected;
