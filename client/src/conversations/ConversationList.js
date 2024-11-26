import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { RiChatNewFill } from "react-icons/ri";
import StartConversation from './StartConversation';
import config from '../config';

const ConversationList = ({ onSelectUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${config.API_BASE_URL}/conversations`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error(`Error: ${res.statusText}`);
                const data = await res.json();
                setChats(data.conversations); // Assuming your API returns conversations
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchChats();
    }, []);

    // Filter chats based on search term
    const filteredChats = chats.filter((chat) => {
        const isSender = chat.sender._id === JSON.parse(localStorage.getItem('user')).id;
        const otherUser = isSender ? chat.receiver : chat.sender;
        // Safely check if the name exists
        return otherUser && otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleChatClick = (chat) => {
        setActiveChat(chat._id); // Set active chat by unique property (like name or ID)
        onSelectUser(chat); // Trigger the function to select the user
    };

    const handleModalClose = (newConversation) => {
        setIsModalOpen(false);

        if (newConversation) {
            setChats((prevChats) => {
                // Check if the conversation already exists
                const exists = prevChats.some(
                    (chat) =>
                        (chat.sender._id === newConversation.sender._id &&
                            chat.receiver._id === newConversation.receiver._id) ||
                        (chat.sender._id === newConversation.receiver._id &&
                            chat.receiver._id === newConversation.sender._id)
                );
                // If it doesn't exist, prepend it to the list
                if (!exists) {
                    return [newConversation, ...prevChats];
                }
                return prevChats;
            });
            
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
                <div className="">
                    {filteredChats.length > 0 ? (
                        filteredChats.map((chat, index) => {
                            const isSender = chat.sender._id === JSON.parse(localStorage.getItem('user')).id;
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
                        <p className="text-center text-gray-500">No chats found</p>
                    )}
                </div>
            </div>
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