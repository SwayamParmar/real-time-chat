import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useConversation } from "../conversationContext/ConversationContext";

const StartConversation = ({ onClose, closePopup }) => {
    const { users, fetchUsers, startConversation, loadingUsers } = useConversation();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleStartConversation = async (user) => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const newConversation = await startConversation(currentUser.id, user._id);
        onClose(newConversation);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[400px]">
                <div className="flex items-center border bg-[#e6ebf5] border-[#e6ebf5] rounded-lg p-2 mb-4">
                    <FaSearch className="text-gray-500 ml-2 mr-4" />
                    <input
                        type="text"
                        placeholder="Search users"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[#1F2937]"
                    />
                </div>
                {loadingUsers ? (
                    <div className="text-center text-lg">Loading users...</div>
                ) : (
                    <div className="max-h-[350px] overflow-y-auto">
                        {filteredUsers.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-2 cursor-pointer rounded-sm hover:bg-[#e8f0f8]"
                                onClick={() => handleStartConversation(user)}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    {user.name[0]}
                                </div>
                                <p>{user.name}</p>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={closePopup} className="w-full bg-[#fd6254] text-white py-2 rounded-lg text-center font-semibold hover:bg-[#FF6F61] focus:outline-none mt-3 transform transition-all duration-300 ease-in-out">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default StartConversation;
