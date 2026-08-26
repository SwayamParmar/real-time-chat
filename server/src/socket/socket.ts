import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { Types } from "mongoose";
import User from "../models/user.model";
import Conversation from "../models/conversation.model";

import { verifyToken } from "../utils/jwt.util";
import { env } from "../config/env";

import type {
    SendMessageData,
    SocketUser,
    MarkAsReadData,
    TypingData,
    EditMessageData,
    DeleteMessageData,
} from "../types/socket.types";
import { deleteFromCloudinary } from "../config/cloudinary";
import * as messageService from "../services/message.service";
import { MessageType } from "../enums/message-type.enum";
import Message, { type Message as MessageDoc } from "../models/message.model";

let io: Server;

/*
 * PRESENCE
 *
 * Connect/disconnect alone cannot answer "is this user online?" — a user has
 * as many sockets as they have tabs, a refresh briefly overlaps two of them,
 * and a killed process (Render restart) never runs `disconnect` at all. So
 * presence is ref-counted per user and backed by a heartbeat + TTL sweep:
 *
 *  - userSockets  : userId -> set of live socket ids (multi-tab ref count)
 *  - socketSeen   : socketId -> last heartbeat timestamp (liveness)
 *  - offlineTimers: userId -> pending "go offline" write (refresh grace)
 *
 * The DB `is_online` flag is only written on the 0↔1 transitions, so it stays
 * in sync with the map instead of racing it.
 */
const userSockets = new Map<string, Set<string>>();
const socketSeen = new Map<string, number>();
const offlineTimers = new Map<string, NodeJS.Timeout>();

// A socket with no heartbeat for this long is treated as dead and swept.
const PRESENCE_TTL_MS = 45_000;
const SWEEP_INTERVAL_MS = 15_000;
// Grace before writing offline, so a refresh (old socket drops, new one
// arrives ~1s later) never flickers the user to offline for everyone.
const OFFLINE_GRACE_MS = 5_000;

const onlineUserIds = (): string[] => Array.from(userSockets.keys());

const broadcastPresence = (userId: string, isOnline: boolean, lastSeen: Date): void => {
    io.emit("presenceUpdate", { userId, isOnline, lastSeen });
    io.emit("onlineUsers", onlineUserIds());
};

const registerSocket = async (userId: string, socketId: string): Promise<void> => {
    const pending = offlineTimers.get(userId);
    if (pending) {
        clearTimeout(pending);
        offlineTimers.delete(userId);
    }

    socketSeen.set(socketId, Date.now());

    const sockets = userSockets.get(userId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;
    sockets.add(socketId);
    userSockets.set(userId, sockets);

    const lastSeen = new Date();
    if (wasOffline) {
        await User.findByIdAndUpdate(userId, { is_online: 1, lastSeen });
    }
    broadcastPresence(userId, true, lastSeen);
};

const writeOffline = async (userId: string): Promise<void> => {
    offlineTimers.delete(userId);
    // Re-check: a tab may have reconnected while the grace timer was pending.
    if ((userSockets.get(userId)?.size ?? 0) > 0) return;

    const lastSeen = new Date();
    try {
        await User.findByIdAndUpdate(userId, { is_online: 0, lastSeen });
    } catch (error) {
        console.error("Presence offline write error:", error);
    }
    broadcastPresence(userId, false, lastSeen);
};

const unregisterSocket = (userId: string, socketId: string, immediate = false): void => {
    socketSeen.delete(socketId);

    const sockets = userSockets.get(userId);
    if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) userSockets.delete(userId);
        // Another tab is still live — the user stays online.
        else return;
    }

    if (offlineTimers.has(userId)) return;

    if (immediate) {
        void writeOffline(userId);
        return;
    }
    offlineTimers.set(
        userId,
        setTimeout(() => void writeOffline(userId), OFFLINE_GRACE_MS)
    );
};

/*
 * Half-open sockets (laptop lid, killed browser, dropped mobile network) can
 * sit in the map without ever emitting `disconnect`. Sweep anything that has
 * stopped heart-beating and force it closed so presence converges.
 */
const sweepStalePresence = (): void => {
    const cutoff = Date.now() - PRESENCE_TTL_MS;

    for (const [socketId, seenAt] of socketSeen) {
        if (seenAt > cutoff) continue;

        const socket = io.sockets.sockets.get(socketId) as AuthenticatedSocket | undefined;
        if (socket) {
            socket.disconnect(true);
            continue;
        }
        // Socket object already gone but the entry lingered — drop it by hand.
        for (const [userId, sockets] of userSockets) {
            if (sockets.has(socketId)) {
                unregisterSocket(userId, socketId, true);
                break;
            }
        }
        socketSeen.delete(socketId);
    }
};

/*
 * A crashed or redeployed process leaves every user it was serving flagged
 * `is_online: 1` forever, because `disconnect` never ran. Nothing is connected
 * at boot by definition, so clear the flag before accepting connections.
 */
const resetPresenceOnBoot = async (): Promise<void> => {
    try {
        await User.updateMany({ is_online: 1 }, { $set: { is_online: 0 } });
    } catch (error) {
        console.error("Presence boot reset error:", error);
    }
};

/**
 * Whether the user still has a live socket anywhere.
 *
 * REST logout uses this so signing out of one tab does not mark an account
 * offline while another tab is still connected.
 */
export const isUserOnline = (userId: string): boolean =>
    (userSockets.get(userId)?.size ?? 0) > 0;

interface AuthenticatedSocket extends Socket {
    user: SocketUser;
}

export const initSocket = (server: HttpServer): void => {
    io = new Server(server, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
        // Tighter than the 25s/20s defaults: a closed browser is detected in
        // ~30s instead of ~45s, and the engine pong doubles as our heartbeat.
        pingInterval: 15_000,
        pingTimeout: 15_000,
    });

    void resetPresenceOnBoot();
    setInterval(sweepStalePresence, SWEEP_INTERVAL_MS).unref();

    io.use((socket, next) => {
        const authSocket = socket as AuthenticatedSocket;
        const token = socket.handshake.query.token;
        if (typeof token !== "string" || !token) {
            next(new Error("No token provided"));
            return;
        }

        try {
            const payload = verifyToken(token);

            authSocket.user = payload;

            next();
        } catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        const authSocket = socket as AuthenticatedSocket;
        const userId = authSocket.user.userId;

        console.log("✅ Socket connected:", userId);
        await socket.join(`user:${userId}`);
        await registerSocket(userId, socket.id);

        // Send the joining socket the current roster immediately, rather than
        // leaving it blank until someone else's presence happens to change.
        socket.emit("onlineUsers", onlineUserIds());

        // Heartbeats. The engine-level pong is free and always present; the
        // explicit client ping keeps the TTL fresh even on transports where
        // the pong is not surfaced.
        socket.conn.on("heartbeat", () => socketSeen.set(socket.id, Date.now()));
        socket.on("presencePing", () => socketSeen.set(socket.id, Date.now()));

        const deliveredAt = new Date();

        try {
            const conversations = await Conversation.find({
                participants: new Types.ObjectId(userId),
            });

            const conversationIds = conversations.map((conversation) => conversation._id);

            const undeliveredMessages = await Message.find({
                conversationId: {
                    $in: conversationIds,
                },
                sender: {
                    $ne: new Types.ObjectId(userId),
                },
                deliveredTo: {
                    $ne: new Types.ObjectId(userId),
                },
            });

            if (undeliveredMessages.length > 0) {
                const userObjectId = new Types.ObjectId(userId);

                await Message.updateMany(
                    {
                        conversationId: {
                            $in: conversationIds,
                        },
                        sender: {
                            $ne: userObjectId,
                        },
                        deliveredTo: {
                            $ne: userObjectId,
                        },
                    },
                    {
                        $addToSet: {
                            deliveredTo: userObjectId,
                        },
                        $set: {
                            deliveredAt,
                        },
                    }
                );

                const senderIds = [
                    ...new Set(undeliveredMessages.map((message) => message.sender.toString())),
                ];

                senderIds.forEach((senderId) => {
                    const conversationIdsForSender = [
                        ...new Set(
                            undeliveredMessages
                                .filter((message) => message.sender.toString() === senderId)
                                .map((message) => message.conversationId.toString())
                        ),
                    ];

                    io.to(`user:${senderId}`).emit("messagesDelivered", {
                        conversationIds: conversationIdsForSender,
                        deliveredAt,
                    });
                });
            }
        } catch (error) {
            console.error("Delivery on connect error:", error);
        }

        // JOIN CONVERSATION ROOM (with auth guard)
        socket.on("joinConversation", async (conversationId: string) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });

                if (!conversation) {
                    console.warn(`Unauthorized join attempt by ${userId} on ${conversationId}`);
                    return;
                }

                await socket.join(conversationId);
                console.log(`${userId} joined room: ${conversationId}`);
            } catch (error) {
                console.error("joinConversation error:", error);
            }
        });

        // LEAVE CONVERSATION ROOM
        socket.on("leaveConversation", async (conversationId: string) => {
            try {
                await socket.leave(conversationId);
                console.log(`${userId} left room: ${conversationId}`);
            } catch (error) {
                console.error("leaveConversation error:", error);
            }
        });

        // Handle sending messages
        socket.on("sendMessage", async (data: SendMessageData) => {
            const { conversationId, content, messageType, file, tempId } = data;
            try {
                const message = await messageService.storeMessage({
                    conversationId,
                    senderId: userId,
                    content,
                    messageType: messageType ?? MessageType.TEXT,
                    file,
                });

                /*
                 * Deliver to the conversation room AND to each participant's
                 * personal room.
                 *
                 * A socket only joins `conversationId` when that chat is
                 * actually opened (see joinConversation), so emitting to the
                 * conversation room alone reached nobody who was sitting on
                 * their conversation list — their list could not update until
                 * a refetch. The `user:<id>` rooms are joined on connect and
                 * are already how messagesDelivered / messagesSeen /
                 * messageEdited / messageDeleted reach a user wherever they
                 * are; receiveMessage was the outlier.
                 *
                 * Socket.IO delivers once per socket across a union of rooms,
                 * so a participant who does have the chat open — and is
                 * therefore in both rooms — still receives exactly one event.
                 */
                const conversation = await Conversation.findById(conversationId)
                    .select("participants")
                    .lean();

                const rooms = [
                    conversationId,
                    ...(conversation?.participants ?? []).map(
                        (participantId) => `user:${participantId.toString()}`
                    ),
                ];

                io.to(rooms).emit("receiveMessage", {
                    ...message.toObject(),
                    tempId,
                });
            } catch (error) {
                console.error("[sendMessage] Error:", error);
                socket.emit("messageError", { message: "Failed to send message", tempId });
            }
        });

        // Mark as Read
        socket.on("markAsRead", async ({ conversationId }: MarkAsReadData) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });
                if (!conversation) return;
                const seenAt = new Date();
                await Message.updateMany(
                    {
                        conversationId,
                        seenBy: {
                            $ne: new Types.ObjectId(userId),
                        },
                        sender: {
                            $ne: new Types.ObjectId(userId),
                        },
                    },
                    {
                        $addToSet: {
                            seenBy: new Types.ObjectId(userId),
                        },
                        $set: { seenAt },
                    }
                );
                const senderId = conversation.participants.find((id) => id.toString() !== userId);
                if (!senderId) return;
                io.to(`user:${senderId}`).emit("messagesSeen", {
                    conversationId,
                    seenAt,
                });
                socket.to(conversationId).emit("messagesRead", {
                    conversationId,
                    userId,
                });
            } catch (error) {
                console.error("markAsRead socket error:", error);
            }
        });

        // Handle typing indicator
        socket.on("typing", ({ conversationId, userId: typingUserId }: TypingData) => {
            socket.to(conversationId).emit("userTyping", {
                conversationId,
                userId: typingUserId,
            });
        });

        socket.on("stopTyping", ({ conversationId, userId: typingUserId }: TypingData) => {
            socket.to(conversationId).emit("userStopTyping", {
                conversationId,
                userId: typingUserId,
            });
        });

        // handle edit message
        socket.on("editMessage", async ({ messageId, content }: EditMessageData) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    sender: userId,
                });
                if (!message) return;
                message.content = content;
                message.isEdited = true;
                await message.save();
                const populatedMessage = await message.populate("sender", "name email");

                /*
                 * Same fan-out as receiveMessage / messageDeleted: the
                 * conversation room only holds sockets with the chat open, so
                 * a recipient on their conversation list never learned the
                 * message had changed and kept previewing the old text.
                 */
                const conversationId = message.conversationId.toString();
                const conversation = await Conversation.findById(message.conversationId)
                    .select("participants")
                    .lean();

                const rooms = [
                    conversationId,
                    ...(conversation?.participants ?? []).map(
                        (participantId) => `user:${participantId.toString()}`
                    ),
                ];

                io.to(rooms).emit("messageEdited", populatedMessage);
            } catch (error) {
                console.error("editMessage error:", error);
            }
        });

        // handle delete message
        socket.on("deleteMessage", async ({ messageId }: DeleteMessageData) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    sender: userId,
                });
                if (!message) return;
                if (message.file?.url) {
                    const resourceType =
                        message.messageType === MessageType.VIDEO
                            ? "video"
                            : message.messageType === MessageType.FILE
                              ? "raw"
                              : "image";

                    await deleteFromCloudinary(message.file.url, resourceType);
                }

                message.isDeleted = true;
                message.file = {
                    url: "",
                    name: "",
                    size: 0,
                };

                await message.save();
                const conversationId = message.conversationId.toString();

                /*
                 * A soft delete leaves `conversation.lastMessage` pointing at
                 * the message that just went away, so the list preview stayed
                 * on it even across a full refetch. Repoint it at the newest
                 * surviving message, or clear it when that was the only one.
                 *
                 * timestamps:false on purpose — getConversations sorts by
                 * `updatedAt`, and deleting a message should not shove the
                 * conversation to the top of everyone's list.
                 */
                const conversation = await Conversation.findById(message.conversationId).select(
                    "participants lastMessage"
                );

                let lastMessage: MessageDoc | null = null;

                if (conversation) {
                    if (conversation.lastMessage?.toString() === messageId) {
                        lastMessage = await Message.findOne({
                            conversationId: message.conversationId,
                            isDeleted: { $ne: true },
                        })
                            .sort({ createdAt: -1 })
                            .populate("sender", "name email");

                        await Conversation.updateOne(
                            { _id: conversation._id },
                            lastMessage
                                ? { $set: { lastMessage: lastMessage._id } }
                                : { $unset: { lastMessage: 1 } },
                            { timestamps: false }
                        );
                    } else if (conversation.lastMessage) {
                        // Not the last message — send the unchanged pointer
                        // anyway so the payload is always authoritative and
                        // the client never has to infer what to keep.
                        lastMessage = await Message.findById(conversation.lastMessage).populate(
                            "sender",
                            "name email"
                        );
                    }
                }

                /*
                 * Same fan-out as receiveMessage: the conversation room only
                 * contains sockets that currently have the chat open, so a
                 * recipient sitting on their conversation list heard nothing
                 * and kept showing the deleted message as the preview until
                 * they opened the chat. The `user:<id>` rooms are joined on
                 * connect, and Socket.IO delivers once per socket across the
                 * union, so a recipient in both rooms still gets one event.
                 */
                const rooms = [
                    conversationId,
                    ...(conversation?.participants ?? []).map(
                        (participantId) => `user:${participantId.toString()}`
                    ),
                ];

                io.to(rooms).emit("messageDeleted", {
                    messageId,
                    conversationId,
                    lastMessage,
                });
            } catch (error) {
                console.error("deleteMessage error:", error);
            }
        });

        /*
         * An explicit sign-out is not a dropped connection: drop this tab's
         * socket right away and skip the refresh grace period, so the account
         * reads offline immediately unless another tab is still connected.
         */
        socket.on("presenceLogout", () => {
            unregisterSocket(userId, socket.id, true);
            socket.disconnect(true);
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", userId);
            unregisterSocket(userId, socket.id);
        });
    });
};
