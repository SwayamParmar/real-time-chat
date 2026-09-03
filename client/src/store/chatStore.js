import { create } from "zustand";
import { toast } from "react-toastify";
import config from "../config";
import { useAuthStore } from "./authStore";
import { connectSocket, getSocket } from "../socket/socketClient";
import { notifyNewMessage } from "../notifications/notify";
import { lastMessagePreview } from "../conversations/lastMessagePreview";
const PAGE_SIZE = 20;

const timeOf = (message) => {
    const value = new Date(message?.createdAt).getTime();
    // No timestamp means an optimistic upload the client just created.
    return Number.isNaN(value) ? Infinity : value;
};

/**
 * Merge a freshly fetched page 1 with the messages already on screen, keeping
 * anything local that arrived while the request was in flight.
 */
const mergeInFlightMessages = (fetched, local) => {
    if (!local?.length) return fetched;

    const returned = new Set(fetched.map((m) => m._id));
    const newestFetchedAt = fetched.length ? timeOf(fetched[fetched.length - 1]) : 0;

    const inFlight = local.filter(
        (m) => !returned.has(m._id) && timeOf(m) >= newestFetchedAt
    );

    return inFlight.length ? [...fetched, ...inFlight] : fetched;
};
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
    pendingUploads: {}, // { tempId: { file, progress, conversationId, caption } }

    // Render cache so re-opening a conversation paints instantly. Written on
    // leaving a conversation; the fetch still runs and its response wins.
    messagesByConversation: {}, // { conversationId: Message[] }

    // INIT SOCKET
    initSocket: () => {
        if (get().socketInitialized) return;

        const socket = connectSocket();
        if (!socket) return;

        set({ socketInitialized: true });

        socket.off("receiveMessage");
        socket.off("onlineUsers");
        socket.off("presenceUpdate");
        socket.off("userTyping");
        socket.off("userStopTyping");
        socket.off("messageEdited");
        socket.off("messageDeleted");
        socket.off("messagesSeen");
        socket.off("messagesDelivered");
        socket.off("messageError");
        // Not connect/disconnect: socketClient owns those handlers.

        // Surface refused sends instead of failing silently.
        socket.on("messageError", ({ message, tempId }) => {
            console.error("Send failed:", message);
            toast.error(message || "Message could not be sent", {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
            if (tempId) get().failPendingMessage(tempId);
        });

        socket.on("receiveMessage", (message) => {
            const { activeConversationId } = get();

            const msgConvId = message.conversationId?._id?.toString() || message.conversationId?.toString();
            if (message.tempId) {
                get().replacePendingMessage(message.tempId, {
                    ...message,
                    isTemp: false,
                    uploading: false,
                });
            } else {
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
            }

            // Move the conversation to the top of the list with its new last
            // message. Matched on the normalised msgConvId, since the payload
            // may carry conversationId as an id or as a populated object.
            set((state) => {
                const existing = state.conversations.find((conv) => conv._id === msgConvId);
                if (!existing) return state;

                return {
                    conversations: [
                        { ...existing, lastMessage: message },
                        ...state.conversations.filter((conv) => conv._id !== msgConvId),
                    ],
                };
            });

            // Unknown conversation (someone just started a new chat): there is
            // nothing local to reorder, so pull the list.
            if (msgConvId && !get().conversations.some((conv) => conv._id === msgConvId)) {
                get().fetchConversations();
            }

            // Notify unless the recipient is looking at this chat. Checking
            // visibilityState covers the background-tab case.
            const { user } = useAuthStore.getState();
            const isMine = message.sender?._id === user?.id;
            const isWatching =
                msgConvId === get().activeConversationId &&
                document.visibilityState === "visible";

            if (!isMine && !isWatching) {
                notifyNewMessage({
                    messageId: message._id,
                    senderName: message.sender?.name || "Someone",
                    body: lastMessagePreview(message).text,
                    onClick: () => get().fetchMessages(msgConvId),
                });
            }
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
            const editedConvId =
                updatedMessage.conversationId?._id?.toString() ||
                updatedMessage.conversationId?.toString();

            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === updatedMessage._id ? updatedMessage : m
                ),
                // Editing the newest message changes what the list previews.
                conversations: state.conversations.map((conv) =>
                    conv.lastMessage?._id === updatedMessage._id
                        ? { ...conv, lastMessage: updatedMessage }
                        : conv
                ),
                messagesByConversation: state.messagesByConversation[editedConvId]
                    ? {
                          ...state.messagesByConversation,
                          [editedConvId]: state.messagesByConversation[editedConvId].map((m) =>
                              m._id === updatedMessage._id ? updatedMessage : m
                          ),
                      }
                    : state.messagesByConversation,
            }));
        });

        // `lastMessage` on the payload is the preview after the delete: the
        // previous surviving message, or null if that was the only one.
        socket.on("messageDeleted", ({ messageId, conversationId, lastMessage }) => {
            set((state) => ({
                // ✅ update messages list
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, isDeleted: true } : m
                ),
                // ✅ update lastMessage in conversation list
                conversations: state.conversations.map((conv) =>
                    conv._id === conversationId
                        ? { ...conv, lastMessage: lastMessage ?? null }
                        : conv
                ),
                // Keep the render cache in step with the live list.
                messagesByConversation: state.messagesByConversation[conversationId]
                    ? {
                          ...state.messagesByConversation,
                          [conversationId]: state.messagesByConversation[conversationId].map((m) =>
                              m._id === messageId ? { ...m, isDeleted: true } : m
                          ),
                      }
                    : state.messagesByConversation,
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

        // Per-user presence transition. The roster above carries no timestamp,
        // so this is what keeps lastSeen current.
        socket.on("presenceUpdate", ({ userId, isOnline, lastSeen }) => {
            set((state) => ({
                onlineUsers: isOnline
                    ? state.onlineUsers.includes(userId)
                        ? state.onlineUsers
                        : [...state.onlineUsers, userId]
                    : state.onlineUsers.filter((id) => id !== userId),
                conversations: state.conversations.map((conv) => ({
                    ...conv,
                    participants: conv.participants.map((p) =>
                        p._id === userId
                            ? { ...p, is_online: isOnline ? 1 : 0, lastSeen }
                            : p
                    ),
                })),
                users: state.users.map((u) =>
                    u._id === userId ? { ...u, is_online: isOnline ? 1 : 0, lastSeen } : u
                ),
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

        // Nothing is emitted here: Socket.IO replays buffered emits on
        // reconnect, so a leave would arrive just as we rejoin.
        let wasDisconnected = false;
        socket.on("disconnect", () => {
            wasDisconnected = true;
        });

        socket.on("connect", () => {
            if (!wasDisconnected) return;
            wasDisconnected = false;
            get().resync();
        });
    },

    // Resync after a gap in the connection. A reconnect gets a new server-side
    // socket, so conversation rooms have to be rejoined and state refetched.
    resync: () => {
        const { activeConversationId } = get();
        // Their stopTyping went to the old socket, so clear it here.
        set({ typingUsers: {} });
        get().fetchConversations();
        // fetchMessages rejoins the room and marks as read on its way through.
        if (activeConversationId) {
            get().fetchMessages(activeConversationId, 1, true);
        }
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
    fetchMessages: async (conversationId, page = 1, force = false) => {
        const token = useAuthStore.getState().token;

        // Leave previous room, join new one
        const socket = getSocket();
        const prevConvId = get().activeConversationId;
        if (prevConvId && prevConvId !== conversationId) {
            socket?.emit("leaveConversation", prevConvId);
        }
        socket?.emit("joinConversation", conversationId);

        // Re-selecting the conversation that is already open is a no-op; the
        // socket keeps its messages live. The guard sits after the room join
        // so re-selecting still re-asserts membership. An active conversation
        // with no messages still refetches, so a failed load can be retried.
        const reselectingOpenConversation =
            page === 1 &&
            prevConvId === conversationId &&
            (get().loadingMessages || get().messages.length > 0);

        if (reselectingOpenConversation && !force) return;

        // Mark the conversation active before awaiting the network, so the
        // room pane can paint its header, composer and skeleton right away.
        // Page 1 also drops the previous conversation's messages.
        if (page === 1) {
            const state = get();

            // Snapshot the conversation being left, capped to one page to match
            // what the revalidation below will replace it with.
            const outgoing =
                prevConvId && prevConvId !== conversationId && state.messages.length
                    ? { [prevConvId]: state.messages.slice(-PAGE_SIZE) }
                    : null;

            // Show the cached copy; the fetch below overwrites it.
            const cached = state.messagesByConversation[conversationId];

            set({
                activeConversationId: conversationId,
                messages: cached ?? [],
                page: 1,
                hasMore: true,
                // editingMessage is global state, so clear it on the way out.
                ...(prevConvId !== conversationId ? { editingMessage: null } : null),
                // Kept true when serving from cache so auto-pagination cannot
                // fire a page 2 while page 1 is still revalidating.
                loadingMessages: true,
                ...(outgoing
                    ? { messagesByConversation: { ...state.messagesByConversation, ...outgoing } }
                    : null),
            });
        } else {
            set({ loadingMessages: true });
        }

        // Wrapped so a failed request cannot strand loadingMessages at true,
        // which would leave the conversation unopenable.
        try {
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

            // Two opens can be in flight at once, so drop a response whose
            // conversation is no longer the one on screen.
            if (get().activeConversationId !== conversationId) return;

            set((state) => {
                // Merge rather than replace, so a message that arrived while
                // page 1 was in flight is kept and re-appended in order.
                const merged =
                    page === 1
                        ? mergeInFlightMessages(data.messages ?? [], state.messages)
                        : [...data.messages, ...state.messages];

                return {
                    messages: merged,
                    activeConversationId: conversationId,
                    page,
                    hasMore: data.messages.length === PAGE_SIZE,
                };
            });

            if (page === 1) {
                get().markAsRead(conversationId);
            }

            // Small tick to let DOM update before marking loading done
            await new Promise((resolve) => requestAnimationFrame(resolve));
        } catch (error) {
            console.error("Fetch messages error:", error);
        } finally {
            // Only for the conversation still on screen.
            if (get().activeConversationId === conversationId) {
                set({ loadingMessages: false });
            }
        }
    },

    // Deselect the open conversation. Distinct from the mobile back gesture,
    // which only hides the room pane and keeps it loaded.
    closeConversation: () => {
        const { activeConversationId, messages } = get();
        if (!activeConversationId) return;

        getSocket()?.emit("leaveConversation", activeConversationId);

        set((state) => ({
            activeConversationId: null,
            messages: [],
            page: 1,
            hasMore: true,
            editingMessage: null,
            ...(messages.length
                ? {
                      messagesByConversation: {
                          ...state.messagesByConversation,
                          [activeConversationId]: messages.slice(-PAGE_SIZE),
                      },
                  }
                : null),
        }));
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
    sendMessage: ({ conversationId, content, messageType = "text", file = null, tempId = null }) => {
        const socket = getSocket();
        if (!socket) return;
        if (!content?.trim() && !file) return;
        socket.emit("sendMessage", {
            conversationId,
            content,
            messageType,
            file,
            tempId, // ✅ now backend receives it and echoes it back
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

    // ✅ Add these actions
    addPendingMessage: (tempMessage) => {
        set((state) => ({
            messages: [...state.messages, tempMessage],
            pendingUploads: {
                ...state.pendingUploads,
                [tempMessage._id]: tempMessage,
            },
        }));
    },

    replacePendingMessage: (tempId, realMessage) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m._id === tempId ? realMessage : m
            ),
            pendingUploads: Object.fromEntries(
                Object.entries(state.pendingUploads).filter(([k]) => k !== tempId)
            ),
        }));
    },

    failPendingMessage: (tempId) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m._id === tempId ? { ...m, uploadFailed: true, uploading: false } : m
            ),
            pendingUploads: Object.fromEntries(
                Object.entries(state.pendingUploads).filter(([k]) => k !== tempId)
            ),
        }));
    },

    // ✅ Main upload action
    uploadAndSend: async ({ files, caption, conversationId }) => {
        const token = useAuthStore.getState().token;
        const user = useAuthStore.getState().user;

        // ✅ Create one temp message per file
        const tempMessages = files.map((file, i) => ({
            _id: `temp_${Date.now()}_${i}`,
            conversationId,
            sender: { _id: user.id, name: user.name },
            content: i === 0 ? caption : "",
            messageType: file.type?.startsWith("video/") ? "video"
                : file.type?.startsWith("image/") ? "image" : "file",
            file: {
                url: file instanceof Blob ? URL.createObjectURL(file) : "",
                name: file.name,
                size: file.size,
            },
            uploading: true,       // ✅ show spinner
            uploadFailed: false,
            seenBy: [user.id],
            deliveredTo: [],
            createdAt: new Date().toISOString(),
            isTemp: true,
        }));

        // ✅ Add all temp messages to chat immediately
        tempMessages.forEach((msg) => get().addPendingMessage(msg));

        // ✅ Upload each file independently in parallel
        tempMessages.forEach(async (tempMsg, i) => {
            const file = files[i];
            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch(`${config.API_BASE_URL}/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload failed");

                const fileData = await res.json();

                // ✅ Send via socket after upload
                get().sendMessage({
                    conversationId,
                    content: tempMsg.content,
                    messageType: fileData.type === "raw" ? "file" : fileData.type,
                    file: {
                        url: fileData.url,
                        name: fileData.name,
                        size: fileData.size,
                    },
                    tempId: tempMsg._id, // ✅ pass tempId so we can replace it
                });

            } catch (err) {
                console.error("Upload failed for:", file.name, err);
                get().failPendingMessage(tempMsg._id);
            }
        });
    },

    // Clear the signed-in session. socketInitialized matters most: initSocket()
    // short-circuits on it, so the next sign-in would attach no listeners.
    reset: () => set({
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
        pendingUploads: {},
        // Cleared so one account's messages are not left in memory for the
        // next person to sign in on this tab.
        messagesByConversation: {},
    }),
}));