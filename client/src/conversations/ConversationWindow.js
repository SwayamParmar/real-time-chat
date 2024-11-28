import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaPaperPlane } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { useConversation } from "../conversationContext/ConversationContext";

const ConversationWindow = ({ selectedUser, toggleAbout }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const conversationId = selectedUser?._id;
    const { messages, loadingMessages, fetchMessages, sendMessage, } = useConversation();

    // Toggle search visibility
    const toggleSearch = () => setShowSearch((prev) => !prev);

    // Fetch messages when a new conversation is selected
    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
        }
    }, [conversationId, fetchMessages]);

    // Handle sending a message
    const handleSendMessage = () => {
        if (!newMessage.trim()) return; // Don't send if the message is empty

        const user = JSON.parse(localStorage.getItem('user'));
        const senderId = user?.id;
        const receiverId =
            selectedUser?.sender?._id === senderId
                ? selectedUser.receiver?._id
                : selectedUser.sender?._id;

        sendMessage({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            content: newMessage,
        });
        setNewMessage(''); // Clear input
    };

    return (
        <div className="flex-1 flex flex-col bg-[#F4F5F9]" style={{ boxShadow: '0 2px 4px rgba(15,34,58,.12)' }}>
            {selectedUser ? (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                {/* Show the first letter of the other user's name */}
                                {/* {selectedUser.sender?._id === JSON.parse(localStorage.getItem('user')).id
                                    ? selectedUser.receiver?.name[0]
                                    : selectedUser.sender?.name[0]
                                } */}
                            </div>
                            <div>
                                <h3 className="font-medium">
                                    {/* Show the full name of the other user */}
                                    {selectedUser.sender?._id === JSON.parse(localStorage.getItem('user')).id
                                        ? selectedUser.receiver?.name
                                        : selectedUser.sender?.name
                                    }
                                </h3>
                                <p className="text-sm text-green-500">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center ${showSearch ? 'outline outline-gray-300 rounded-md' : ''}`}>
                                {showSearch && (
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        className="px-3 py-1 outline-none w-48 rounded-l-md"
                                    />
                                )}
                                <button onClick={toggleSearch} className={`p-2 ${showSearch ? 'bg-gray-100 rounded-r-md' : ''}`}>
                                    <FaSearch size={20} className="text-gray-500 cursor-pointer" />
                                </button>
                            </div>

                            <button onClick={toggleAbout} className="text-gray-500">
                                <FaEllipsisV size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-scroll hide-scrollbar">
                        {loadingMessages ? (
                                <p>Loading messages...</p>
                            ) : messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            msg.sender._id === JSON.parse(localStorage.getItem('user')).id ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                    <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
                                        <p>{msg.content}</p>
                                        <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No messages yet</p>
                        )}
                    </div>

                    {/* Input Section */}
                    <div className="p-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 border border-gray-300 shadow-sm">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 bg-transparent px-2 py-1 outline-none text-gray-800"
                            />
                            <button onClick={handleSendMessage} className="text-blue-500 hover:text-blue-600">
                                <FaPaperPlane size={20} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
};

export default ConversationWindow;
