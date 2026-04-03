import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash.debounce";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

const StartConversation = ({ onClose, closePopup }) => {
    const {
        users,
        conversations,
        fetchUsers,
        startConversation,
        fetchMessages,
        loadingUsers,
    } = useChatStore();

    const { user: currentUser } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState("");

    // 🔥 Debounced search
    const debouncedSearch = useMemo(
        () =>
            debounce((term) => {
                setSearchTerm(term);
            }, 400),
        []
    );

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users
        .filter((u) => u._id !== currentUser.id) // exclude self
        .filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleStartConversation = async (selectedUser) => {
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
            onClose?.();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[400px]">

                <div className="flex items-center border bg-[#e6ebf5] border-[#e6ebf5] rounded-lg p-2 mb-4">
                    <FaSearch className="text-gray-500 ml-2 mr-4" />
                    <input
                        type="text"
                        placeholder="Search users"
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[#1F2937]"
                    />
                </div>

                {loadingUsers ? (
                    <div className="text-center text-lg">
                        Loading users...
                    </div>
                ) : (
                    <div className="max-h-[350px] overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center gap-4 p-2 cursor-pointer rounded-sm hover:bg-[#e8f0f8]"
                                    onClick={() => handleStartConversation(u)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                        {u.name[0]}
                                    </div>
                                    <p>{u.name}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-lg">
                                No users found
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={closePopup}
                    className="w-full bg-[#fd6254] text-white py-2 rounded-lg text-center font-semibold hover:bg-[#FF6F61] focus:outline-none mt-3 transition-all duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default StartConversation;