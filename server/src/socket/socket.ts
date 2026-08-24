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
import Message from "../models/message.model";

let io: Server;

const onlineUsers = new Map<string, string>();

interface AuthenticatedSocket extends Socket {
    user: SocketUser;
}

export const initSocket = (server: HttpServer): void => {
    io = new Server(server, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

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
        await User.findByIdAndUpdate(userId, {
            is_online: 1,
            lastSeen: new Date(),
        });

        onlineUsers.set(userId, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
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
                io.to(`user:${userId}`).emit("messageEdited", populatedMessage);
                socket
                    .to(message.conversationId.toString())
                    .emit("messageEdited", populatedMessage);
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
                io.to(`user:${userId}`).emit("messageDeleted", {
                    messageId,
                    conversationId,
                });

                socket.to(conversationId).emit("messageDeleted", { messageId, conversationId });
            } catch (error) {
                console.error("deleteMessage error:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", userId);

            User.findByIdAndUpdate(userId, {
                is_online: 0,
                lastSeen: new Date(),
            }).catch((error) => {
                console.error("Disconnect status update error:", error);
            });

            onlineUsers.delete(userId);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });
    });
};
