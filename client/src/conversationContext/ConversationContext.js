import React, { createContext, useContext, useState, useCallback } from "react";
import config from "../config";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const token = localStorage.getItem('token');

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
            setConversations(data.conversations);
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


    // Provide state and functions
    return (
        <ConversationContext.Provider
            value={{
                conversations,
                users,
                loadingConversations,
                loadingUsers,
                fetchConversations,
                fetchUsers,
                startConversation,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => useContext(ConversationContext);
