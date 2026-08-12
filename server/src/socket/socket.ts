import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";

import User from "../models/user.model";
import Conversation from "../models/conversation.model";

import { verifyToken } from "../utils/jwt.util";
import { env } from "../config/env";

import type { SendMessageData, SocketUser } from "../types/socket.types";
import * as messageService from "../services/message.service";
import { MessageType } from "../enums/message-type.enum";

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

                io.to(conversationId).emit("receiveMessage", {
                    ...message.toObject(),
                    tempId,
                });
            } catch (error) {
                console.error("[sendMessage] Error:", error);
                socket.emit("messageError", { message: "Failed to send message", tempId, });
            }
        });
    });
};
