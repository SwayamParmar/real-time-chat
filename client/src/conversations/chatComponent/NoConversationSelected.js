import React from "react";
import { FiMessageSquare } from "react-icons/fi";

const NoConversationSelected = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-base gap-4">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7C6FCD20,#6057B010)" }}
            >
                <FiMessageSquare className="text-[#7C6FCD] w-10 h-10" />
            </div>

            <div className="text-center">
                <p className="text-chat-secondary text-sm font-semibold font-sans">
                    No conversation selected
                </p>
                <p className="text-chat-ghost text-xs mt-1 font-sans">
                    Pick someone from the list to start chatting
                </p>
            </div>
        </div>
    );
};

export default NoConversationSelected;