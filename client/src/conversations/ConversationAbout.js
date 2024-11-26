import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ConversationAbout = ({ user, toggleAbout }) => {
    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 p-4 overflow-y-auto hide-scrollbar">
            <button className="text-gray-500 mb-4" onClick={toggleAbout}>
                <FaTimes size={20} />
            </button>
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {user?.name[0]}
                </div>
                <h3 className="font-medium text-xl">{user?.name}</h3>
                <p className="text-sm text-green-500">Online</p>
            </div>

            <div className="mt-6 space-y-4">
                <p>
                    <strong>Bio:</strong> The notes field is required.
                </p>
                <p>
                    <strong>Phone:</strong> No phone added yet...
                </p>
                <p>
                    <strong>Email:</strong> {user?.email || 'No email added'}
                </p>
            </div>

            <div className="mt-6">
                <h4 className="font-medium">Media</h4>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 1" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 2" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                    <img src="../img/chat.png" alt="Media 3" className="w-full h-20 object-cover" />
                </div>
            </div>

            <button className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg">
                Block
            </button>
        </div>
    );
};

export default ConversationAbout;
