import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import EmptyState from "../../components/ui/EmptyState";

// Fills the right-hand column on desktop. Below md the room pane is hidden
// while no conversation is open.
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
