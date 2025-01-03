import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import config from "../config";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [socket, setSocket] = useState(null); // Socket instance

    const token = localStorage.getItem('token');
    const currentLoggedInUser = JSON.parse(localStorage.getItem('user'));

    // Initialize and manage the Socket.IO connection
    useEffect(() => {
        if (!token) return;

        const socketInstance = io(config.SOCKET_URL, {
            autoConnect: false, // Prevent automatic connection
            query: { 
                token : token, 
                userId : currentLoggedInUser.id 
            },
        });

        socketInstance.connect(); // Explicitly connect the socket

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            console.log("Connected to Socket.IO server");
            socketInstance.emit('joinRoom', { userId: currentLoggedInUser.id });
        });

        // Handle real-time incoming messages
        const handleMessage = (message) => {
            console.log("Real-time message received:", message);
            setMessages((prev) => {
                const messageExists = prev.some((msg) => msg._id === message._id);
                if (!messageExists) {
                    return [...prev, message];
                }
                return prev; // Prevent duplicate messages
            });
        };

        socketInstance.on("receiveMessage", handleMessage);

        // Cleanup on unmount
        return () => {
            socketInstance.off("receiveMessage", handleMessage); // Remove listener
            socketInstance.disconnect(); // Disconnect socket
            console.log("Disconnected from Socket.IO server");
        };
    }, [token]);

    // Fetch all conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoadingConversations(true);
            const res = await fetch(`${config.API_BASE_URL}/conversations`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch conversations");
            const data = await res.json();
            // Filter out duplicate conversations
            const uniqueConversations = data.conversations.filter((conversation, index, self) =>
                index === self.findIndex((c) => c._id === conversation._id)
            );

            setConversations(uniqueConversations);
            setLoadingConversations(false);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setLoadingConversations(false);
        }
    }, [token]);


    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoadingUsers(true);
            const res = await fetch(`${config.API_BASE_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setTimeout(() => {
                setUsers(data.users);
                setLoadingUsers(false);
            }, 500);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoadingUsers(false); // Set loading to false after fetch
        }
    }, [token]);


    // Start a new conversation
    const startConversation = async (senderId, receiverId) => {
        try {
            const res = await fetch(`${config.API_BASE_URL}/conversations/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ sender: senderId, receiver: receiverId }),
            });
            if (!res.ok) throw new Error("Failed to start conversation");
            const data = await res.json();
            setConversations((prev) => [data.conversation, ...prev]);
            return data.conversation;
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw error;
        }
    };


    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            setLoadingMessages(true);
            const res = await fetch(`${config.API_BASE_URL}/messages/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setMessages(data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [token]);


    // Send a new message
    const sendMessage = async (messageData) => {
        if (!messageData.content.trim()) return;

        try {
            // Optimistically update messages
            const optimisticMessage = { ...messageData, isOptimistic: true };
            setMessages((prev) => [...prev, optimisticMessage]);

            // Emit real-time event
            socket?.emit("sendMessage", messageData);

            // Persist message to the database
            const res = await fetch(`${config.API_BASE_URL}/messages/storeMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(messageData),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const { message: savedMessage } = await res.json();

            // Replace optimistic message with the confirmed message
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.isOptimistic && msg.content === optimisticMessage.content
                        ? savedMessage
                        : msg
                )
            );
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Provide state and functions
    return (
        <ConversationContext.Provider
            value={{
                conversations,
                users,
                messages,
                loadingConversations,
                loadingUsers,
                loadingMessages,
                fetchConversations,
                fetchUsers,
                fetchMessages,
                sendMessage,
                startConversation,
                currentLoggedInUser,
                setMessages,
                socket,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => useContext(ConversationContext);
