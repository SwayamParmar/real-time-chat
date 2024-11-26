import React, { useState } from 'react';
import ConversationList from '../conversations/ConversationList';
import ConversationHeader from '../conversations/ConversationHeader';
import ConversationAbout from '../conversations/ConversationAbout';
import ConversationWindow from '../conversations/ConversationWindow';

const Conversation = () => {
    const [showAbout, setShowAbout] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const toggleAbout = () => setShowAbout((prev) => !prev);

    return (
        <div className="flex overflow-hidden bg-gray-50" style={{ height: 'calc(100vh - 0px)' }}>
            <ConversationHeader selectedUser={selectedUser} onSelectUser={setSelectedUser} />
            <ConversationList onSelectUser={setSelectedUser} />
            <div className="flex-1 flex">
                <ConversationWindow selectedUser={selectedUser} toggleAbout={toggleAbout} />
                {showAbout && <ConversationAbout user={selectedUser} toggleAbout={toggleAbout} />}
            </div>
        </div>
    );
};

export default Conversation;