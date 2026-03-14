import { create } from "zustand";
import config from "../config";
import { useAuthStore } from "./authStore";
import { connectSocket, getSocket } from "../socket/socketClient";
const PAGE_SIZE = 20;
export const useChatStore = create((set, get) => ({
    conversations: [],
    users: [],
    messages: [],
    activeConversationId: null,
    loadingConversations: false,
    loadingMessages: false,
    loadingUsers: false,
    onlineUsers: [],
    page: 1,
    hasMore: true,
    socketInitialized: false,
    unreadCounts: {},
    typingUsers: {},
    editingMessage: null,

    // INIT SOCKET
    initSocket: () => {
        if (get().socketInitialized) return;

        const socket = connectSocket();
        if (!socket) return;

        set({ socketInitialized: true });

        socket.off("receiveMessage");
        socket.off("onlineUsers");
        socket.off("userTyping");
        socket.off("userStopTyping");
        socket.off("messageEdited");
        socket.off("messageDeleted");
        socket.off("messagesSeen");
        socket.off("messagesDelivered");

        socket.on("receiveMessage", (message) => {
            const { activeConversationId } = get();

            const msgConvId = message.conversationId?._id?.toString() || message.conversationId?.toString();
            if (msgConvId === activeConversationId) {
                set((state) => {
                    const exists = state.messages.find(m => m._id === message._id);
                    if (exists) return state;
                    return { messages: [...state.messages, message] };
                });

                // Auto-read since this conversation is open
                get().markAsRead(msgConvId);
            } else {
                // Increment unread badge for background conversation
                set((state) => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [msgConvId]: (state.unreadCounts[msgConvId] || 0) + 1,
                    },
                    conversations: state.conversations.map((conv) =>
                        conv._id === msgConvId
                            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                            : conv
                    ),
                }));
            }

            set((state) => {
                const updated = state.conversations.map((conv) =>
                    conv._id === message.conversationId
                        ? { ...conv, lastMessage: message }
                        : conv
                );

                const sorted = [
                    updated.find(c => c._id === message.conversationId),
                    ...updated.filter(c => c._id !== message.conversationId),
                ];

                return { conversations: sorted };
            });
        });

        socket.on("userTyping", ({ conversationId }) => {
            console.log('reached herere : ', conversationId);

            set((state) => ({
                typingUsers: { ...state.typingUsers, [conversationId]: true },
            }));
        });

        socket.on("userStopTyping", ({ conversationId }) => {
            set((state) => ({
                typingUsers: { ...state.typingUsers, [conversationId]: false },
            }));
        });

        socket.on("messageEdited", (updatedMessage) => {
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === updatedMessage._id ? updatedMessage : m
                ),
            }));
        });

        socket.on("messageDeleted", ({ messageId, conversationId }) => {
            set((state) => ({
                // ✅ update messages list
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, isDeleted: true } : m
                ),
                // ✅ update lastMessage in conversation list
                conversations: state.conversations.map((conv) => {
                    if (conv._id !== conversationId) return conv;
                    const isLastMessage = conv.lastMessage?._id === messageId;
                    return {
                        ...conv,
                        lastMessage: isLastMessage
                            ? { ...conv.lastMessage, isDeleted: true }
                            : conv.lastMessage,
                    };
                }),
            }));
        });

        socket.on("onlineUsers", (onlineUserIds) => {
            set((state) => ({
                onlineUsers: onlineUserIds,
                // sync is_online status in conversations list in real time
                conversations: state.conversations.map((conv) => ({
                    ...conv,
                    participants: conv.participants.map((p) => ({
                        ...p,
                        is_online: onlineUserIds.includes(p._id) ? 1 : 0,
                    })),
                })),
            }));
        });

        socket.on("messagesSeen", ({ conversationId, seenAt }) => {
            // ✅ Update seenBy on all messages in local state
            set((state) => ({
                messages: state.messages.map((m) => {
                    const msgConvId = m.conversationId?._id || m.conversationId;
                    if (msgConvId?.toString() !== conversationId) return m;
                    return {
                        ...m,
                        seenBy: m.seenBy?.length > 1 ? m.seenBy : [...(m.seenBy || []), "seen"],
                        seenAt: seenAt,
                    };
                }),
            }));
        });

        socket.on("messagesDelivered", ({ conversationIds, deliveredAt }) => {
            const { user } = useAuthStore.getState();
            set((state) => ({
                messages: state.messages.map((m) => {
                    const msgConvId = m.conversationId?._id?.toString() || m.conversationId?.toString();
                    // ✅ only update messages in active conversation
                    if (!conversationIds.includes(msgConvId)) return m;
                    // ✅ only update if not already delivered
                    if (m.deliveredTo?.length > 0) return m;
                    return {
                        ...m,
                        deliveredTo: [...(m.deliveredTo || []), user.id],
                        deliveredAt,
                    };
                }),

                // ✅ no need to update conversations list for delivery
            }));
        });

        socket.on("disconnect", () => {
            const activeConvId = get().activeConversationId;
            if (activeConvId) {
                socket.emit("leaveConversation", activeConvId);
            }
        });
    },

    // Fetch Conversations
    fetchConversations: async () => {
        const token = useAuthStore.getState().token;
        try {
            set({ loadingConversations: true });
            const res = await fetch(`${config.API_BASE_URL}/conversations`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            // Extract unread counts into a flat map for easy access
            const unreadCounts = {};
            (data.conversations || []).forEach((conv) => {
                unreadCounts[conv._id] = conv.unreadCount || 0;
            });
            set({
                conversations: data.conversations || [],
                unreadCounts,
                loadingConversations: false,
            });
        } catch (error) {
            console.error("Fetch conversations error:", error);
            set({ loadingConversations: false });
        }
    },

    // Fetch Users
    fetchUsers: async () => {
        const token = useAuthStore.getState().token;
        try {
            set({ loadingUsers: true });
            const res = await fetch(`${config.API_BASE_URL}/user`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            set({
                users: data.users || [],
                loadingUsers: false,
            });
        } catch (error) {
            console.error("Fetch users error:", error);
            set({ loadingUsers: false });
        }
    },

    // Start Conversation
    startConversation: async (receiverId) => {
        const token = useAuthStore.getState().token;
        try {
            const res = await fetch(`${config.API_BASE_URL}/conversations/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();
            if (data.conversation) {
                set((state) => ({
                    conversations: [data.conversation, ...state.conversations],
                }));
                return data.conversation;
            }
        } catch (error) {
            console.error("Start conversation error:", error);
        }
    },

    // FETCH MESSAGES (Pagination)
    fetchMessages: async (conversationId, page = 1) => {
        const token = useAuthStore.getState().token;
        set({ loadingMessages: true });

        // Leave previous room, join new one
        const socket = getSocket();
        const prevConvId = get().activeConversationId;
        if (prevConvId && prevConvId !== conversationId) {
            socket?.emit("leaveConversation", prevConvId);
        }
        socket?.emit("joinConversation", conversationId);

        const res = await fetch(
            `${config.API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${PAGE_SIZE}`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
        );
        const data = await res.json();

        // 3s delay for testing loading state visibility — remove later
        if (page > 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // This gives React time to paint messages before scroll restore fires
        set((state) => ({
            messages: page === 1 ? data.messages : [...data.messages, ...state.messages],
            activeConversationId: conversationId,
            page,
            hasMore: data.messages.length === PAGE_SIZE,
        }));

        if (page === 1) {
            get().markAsRead(conversationId);
        }

        // Small tick to let DOM update before marking loading done
        await new Promise((resolve) => requestAnimationFrame(resolve));
        set({ loadingMessages: false });
    },

    loadMoreMessages: async () => {
        const { page, activeConversationId, hasMore, loadingMessages } = get();
        if (!hasMore || loadingMessages) return;
        await get().fetchMessages(activeConversationId, page + 1);
    },

    // Add markAsRead action
    markAsRead: (conversationId) => {
        const socket = getSocket();

        // ✅ Socket handles DB update now — no REST call needed
        socket?.emit("markAsRead", { conversationId });

        // ✅ Clear badge locally immediately
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
            conversations: state.conversations.map((conv) =>
                conv._id === conversationId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            ),
        }));
    },

    // SEND MESSAGE (SOCKET)
    sendMessage: ({ conversationId, content, messageType = "text", file = null }) => {
        const socket = getSocket();
        if (!socket) return;
        if (!content?.trim() && !file) return;
        socket.emit("sendMessage", {
            conversationId,
            content,
            messageType,
            file,
        });
    },

    emitTyping: (conversationId) => {
        const socket = getSocket();
        // No need to send userId, server already knows from socket.user
        socket?.emit("typing", { conversationId });
    },

    emitStopTyping: (conversationId) => {
        const socket = getSocket();
        socket?.emit("stopTyping", { conversationId });
    },

    setEditingMessage: (message) => set({ editingMessage: message }),
    clearEditingMessage: () => set({ editingMessage: null }),

    emitEditMessage: ({ messageId, content }) => {
        const socket = getSocket();
        socket?.emit("editMessage", { messageId, content });
    },

    emitDeleteMessage: (messageId) => {
        const socket = getSocket();
        socket?.emit("deleteMessage", { messageId });
    },
}));