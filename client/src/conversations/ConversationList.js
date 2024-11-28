import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { RiChatNewFill } from "react-icons/ri";
import StartConversation from './StartConversation';
import { useConversation } from "../conversationContext/ConversationContext";

const ConversationList = ({ onSelectUser }) => {
    const { conversations, fetchConversations, loadingConversations } = useConversation(); // Use context
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch conversations on component mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Filter conversations based on the search term
    const filteredChats = conversations.filter((chat) => {
        const currentUserId = JSON.parse(localStorage.getItem('user')).id;
        const isSender = chat.sender._id === currentUserId;
        const otherUser = isSender ? chat.receiver : chat.sender;
        return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleChatClick = (chat) => {
        setActiveChat(chat._id); // Set active chat
        onSelectUser(chat); // Notify parent about the selected chat
    };

    const handleModalClose = (newConversation) => {
        setIsModalOpen(false);
        if (newConversation) {
            setActiveChat(newConversation._id);
            onSelectUser(newConversation); // Automatically open the new conversation
        }
    };

    const startConversationPopup = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="w-96 bg-[#f5f7fb] border-r border-gray-200">
            <div className="w-96 bg-[#fff] pb-1">
                <div className='flex items-center gap-4 justify-between mb-4 px-4 pt-4'>
                    <h2 className="text-xl text-[#1F2937] font-bold">Chats</h2>
                    <button onClick={() => setIsModalOpen(true)}>
                        <RiChatNewFill className="text-2xl text-[#1F2937] font-bold" />
                    </button>
                </div>

                {/* Search Section */}
                <div className="flex items-center border bg-[#e6ebf5] border-[#e6ebf5] rounded-lg p-2 mb-2 mx-4">
                    <FaSearch className="text-gray-500 ml-2 mr-4" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[#1F2937] mr-2"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto hide-scrollbar px-2" style={{ height: 'calc(100vh - 35px)' }}>
                {loadingConversations ? (
                    <div className="text-center text-gray-600 py-4">Loading conversations...</div>
                ) : filteredChats.length > 0 ? (
                    filteredChats.map((chat, index) => {
                        const currentUserId = JSON.parse(localStorage.getItem('user')).id;
                        const isSender = chat.sender._id === currentUserId;
                        const otherUser = isSender ? chat.receiver : chat.sender;

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 cursor-pointer rounded-sm ${
                                    activeChat === chat._id ? 'bg-[#e8f0f8]' : 'hover:bg-[#e8f0f8]'
                                }`}
                                onClick={() => handleChatClick(chat)}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    {/* {otherUser.name[0]} */}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{otherUser.name}</p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {chat && chat.content === '' ? chat.content : chat.content.length > 20 ? `${chat.content.slice(0, 25)}...` : chat.content }
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {/* {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })} */}
                                    Just Now
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 py-4">No chats found</p>
                )}
            </div>

            {/* Start Conversation Modal */}
            {isModalOpen && (
                <StartConversation
                    onClose={handleModalClose}
                    closePopup={startConversationPopup}
                />
            )}
        </div>
    );
};

export default ConversationList;
