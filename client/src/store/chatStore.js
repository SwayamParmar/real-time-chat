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
    // A message with no usable timestamp is one the client just created
    // (an optimistic upload), so treat it as the newest thing there is.
    return Number.isNaN(value) ? Infinity : value;
};

/**
 * Fold a freshly fetched page 1 together with whatever is already on screen.
 *
 * The response describes the conversation as of the moment the request left,
 * so anything that arrived while it was in flight is missing from it. Keeping
 * local messages that are at least as new as the newest one the server
 * returned restores exactly those, without resurrecting older cached history
 * that has since fallen off page 1.
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

    /*
     * Last known messages per conversation, so re-opening one paints instantly
     * instead of waiting on the network. Purely a rendering shortcut: the
     * request still goes out every time and its response is authoritative, so
     * a cache entry can never be the reason something is out of date.
     *
     * Written only when leaving a conversation (see fetchMessages), which
     * snapshots whatever is on screen at that moment — socket updates
     * included. That keeps every real-time handler below untouched.
     *
     * In memory only: never persisted, and cleared by reset() on sign-out.
     */
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
        // Deliberately not connect/disconnect: socketClient owns handlers for
        // those too, and off() would take its heartbeat down with ours.

        /*
         * The server has always emitted messageError when a send is refused —
         * nothing has ever listened for it. A rejected send therefore did
         * exactly nothing on screen: the composer cleared, no message
         * appeared, and no error was raised anywhere the user or the console
         * would show it. Any future "send does nothing" now says why.
         */
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

            /*
             * Move the conversation to the top of the list with its new last
             * message.
             *
             * Matched on the normalised msgConvId. This block used to compare
             * the raw message.conversationId, which the rest of the handler
             * already knew could arrive either as a plain id or as a populated
             * object — so a populated payload matched nothing here.
             *
             * A miss also used to be silently destructive: find() returned
             * undefined and it was spread in as the first element, putting a
             * hole in the list that the renderer would then crash on. That is
             * reachable now that a message can arrive for a conversation the
             * recipient has never opened.
             */
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

            /*
             * First message of a conversation the recipient does not have yet:
             * there is no local record to reorder, so pull the list. Only
             * reachable for a genuinely unknown conversation, which is the
             * moment someone starts a new chat with you.
             */
            if (msgConvId && !get().conversations.some((conv) => conv._id === msgConvId)) {
                get().fetchConversations();
            }

            /*
             * Notify unless the recipient is already looking at this chat.
             * Reading visibilityState live covers the "open in a background
             * tab" case, which activeConversationId alone cannot see.
             */
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
                // This handler only touched `messages` before, so the row kept
                // showing the pre-edit text until the next full refetch.
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

        /*
         * `lastMessage` on the payload is the conversation's authoritative
         * preview *after* the delete — the previous surviving message, or null
         * when that was the only one. It used to be derived locally by marking
         * the existing lastMessage isDeleted, which left the row stuck on a
         * message that no longer exists.
         */
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
                // The cached copy of this conversation has to move with the
                // live list, or re-opening the chat would paint the message
                // back as undeleted until the fetch returns.
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

        /*
         * Per-user presence transition. The roster above answers "who is
         * online" but carries no timestamp, so `lastSeen` stayed frozen at
         * whatever fetchConversations happened to load and the room header
         * showed a stale — or missing — "Last seen". This carries it.
         */
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

        /*
         * Nothing is emitted here on purpose. Socket.IO buffers emits made
         * while disconnected and replays them on reconnect, so a leave sent
         * from this handler would arrive right as we are rejoining.
         */
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

    /*
     * Pull everything back in line after a gap in the connection.
     *
     * A reconnect gets a brand-new server-side socket: it is put back into
     * `user:<id>` automatically, but its conversation rooms are gone and every
     * event sent while we were away is simply lost. Rejoining alone left the
     * list and the open thread stale until the user switched conversations.
     */
    resync: () => {
        const { activeConversationId } = get();
        // Anyone mid-keystroke when we dropped would otherwise stay "typing…"
        // forever, since their stopTyping went to the old socket.
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

        /*
         * Re-selecting the conversation that is already open is a no-op.
         *
         * Every caller used to run straight through to the network, so each
         * extra click on the active row refired the request — and, since a
         * page-1 load clears `messages` first, visibly blanked a thread that
         * was already correct. Its messages are kept live by the socket, so
         * refetching would only replace an up-to-date list with an identical
         * one.
         *
         * The guard sits *after* the room join above, so re-selecting still
         * re-asserts socket membership — the one useful side effect of the
         * old behaviour is kept.
         *
         * Deliberately not skipped when the conversation is active but has no
         * messages and nothing is in flight: that is what a failed request
         * leaves behind, and retrying by tapping the row again should work.
         */
        const reselectingOpenConversation =
            page === 1 &&
            prevConvId === conversationId &&
            (get().loadingMessages || get().messages.length > 0);

        if (reselectingOpenConversation && !force) return;

        /*
         * Mark the conversation active BEFORE awaiting the network.
         *
         * The room pane is derived from activeConversationId, so setting it
         * only once the response landed meant the entire round trip was spent
         * showing "No conversation selected" — the skeleton could not even
         * render, because the room had not mounted yet. Opening a conversation
         * now paints its header, composer and skeleton on the next frame and
         * fills in the messages when they arrive.
         *
         * Page 1 also drops the previous conversation's messages, which
         * otherwise sat under the new header until the fetch resolved.
         */
        if (page === 1) {
            const state = get();

            /*
             * Snapshot the conversation being left. Capped to one page: the
             * revalidation below replaces messages with the newest page, so
             * caching more would show extra history for a moment and then have
             * it vanish when the response lands.
             */
            const outgoing =
                prevConvId && prevConvId !== conversationId && state.messages.length
                    ? { [prevConvId]: state.messages.slice(-PAGE_SIZE) }
                    : null;

            // Stale: show what we already have. Revalidate: the fetch below
            // still runs and overwrites this with the server's version.
            const cached = state.messagesByConversation[conversationId];

            set({
                activeConversationId: conversationId,
                messages: cached ?? [],
                page: 1,
                hasMore: true,
                /*
                 * An unfinished edit does not survive leaving the conversation
                 * it belongs to. It is global store state, so it used to: the
                 * composer in the *next* conversation stayed in edit mode, and
                 * pressing send there edited the old message instead of
                 * sending a new one — silently, since nothing about the new
                 * conversation changed on screen.
                 */
                ...(prevConvId !== conversationId ? { editingMessage: null } : null),
                // Kept true even when serving from cache, so the auto-pagination
                // effect cannot fire a page-2 request that the in-flight page-1
                // revalidation would then throw away. The room shows no spinner
                // for it — see ConversationRoom — so the refresh is silent.
                loadingMessages: true,
                ...(outgoing
                    ? { messagesByConversation: { ...state.messagesByConversation, ...outgoing } }
                    : null),
            });
        } else {
            set({ loadingMessages: true });
        }

        /*
         * Wrapped so a failed request cannot strand loadingMessages at true.
         * That matters more than it used to: activeConversationId is set
         * before the await, so a stuck flag combined with the guard above
         * would make the conversation permanently unopenable. Matches the
         * error handling fetchConversations and fetchUsers already use.
         */
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

            /*
             * Switching conversations is instant now, so two opens can easily
             * be in flight at once. Drop a response whose conversation is no
             * longer the one on screen, rather than letting the slower request
             * overwrite the newer one's messages.
             */
            if (get().activeConversationId !== conversationId) return;

            set((state) => {
                /*
                 * A page-1 response is a snapshot of the moment the request was
                 * issued, so it cannot know about anything that arrived while
                 * it was in flight. Replacing outright therefore silently
                 * deleted a message sent during that window — invisibly in an
                 * empty conversation, where the response is [] and the message
                 * simply vanished with no error anywhere.
                 *
                 * Anything held locally that the server did not return is kept
                 * and re-appended in arrival order.
                 */
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
            // Only for the conversation still on screen: a stale response must
            // not clear the newer one's loading state.
            if (get().activeConversationId === conversationId) {
                set({ loadingMessages: false });
            }
        }
    },

    /*
     * Deselect the open conversation, returning the room pane to its
     * "no conversation selected" state.
     *
     * Distinct from the mobile back gesture, which only hides the room pane
     * and deliberately keeps it loaded. From md up there is no pane to hide —
     * both are always on screen — so closing has to mean clearing the
     * selection. The messages are snapshotted on the way out, exactly as
     * switching conversations does, so re-opening still paints instantly.
     */
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

    // Drop every trace of the signed-in session. Called on logout.
    //
    // socketInitialized is the important one: initSocket() short-circuits on
    // it, so without a reset the next sign-in would attach no listeners at all
    // and the app would look connected while receiving nothing.
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
        // Must be cleared with the rest: otherwise one account's messages
        // would still be in memory for whoever signs in next on this tab.
        messagesByConversation: {},
    }),
}));