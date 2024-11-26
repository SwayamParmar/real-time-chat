// import React, { createContext, useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const ConversationContext = createContext();

// const ConversationProvider = ({ children }) => {
//     const [conversations, setConversations] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [socket, setSocket] = useState(null);

//     useEffect(() => {
//         const newSocket = io.connect('http://localhost:5000', {
//             auth: { token: localStorage.getItem('token') }, // Pass token for authentication
//         });
//         setSocket(newSocket);

//         // Listen for new messages
//         newSocket.on('receiveMessage', (message) => {
//             setMessages((prev) => [...prev, message]);
//         });

//         return () => {
//             newSocket.disconnect();
//         };
//     }, []);

//     // Fetch conversations
//     const fetchConversations = async () => {
//         try {
//             const res = await fetch('/api/conversations', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             const data = await res.json();
//             setConversations(data.conversations);
//         } catch (error) {
//             console.error('Error fetching conversations:', error);
//         }
//     };

//     // Fetch messages for a selected user
//     const fetchMessages = async (conversationId) => {
//         try {
//             const res = await fetch(`/api/conversations/${conversationId}/messages`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             const data = await res.json();
//             setMessages(data.messages);
//         } catch (error) {
//             console.error('Error fetching messages:', error);
//         }
//     };

//     // Send a message
//     const sendMessage = async (messageData) => {
//         try {
//             socket.emit('sendMessage', messageData);
//             setMessages((prev) => [...prev, messageData]);
//         } catch (error) {
//             console.error('Error sending message:', error);
//         }
//     };

//     return (
//         <ConversationContext.Provider
//             value={{
//                 conversations,
//                 selectedUser,
//                 messages,
//                 setSelectedUser,
//                 fetchConversations,
//                 fetchMessages,
//                 sendMessage,
//             }}
//         >
//             {children}
//         </ConversationContext.Provider>
//     );
// };

// export { ConversationContext, ConversationProvider };