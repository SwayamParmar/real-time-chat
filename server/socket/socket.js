const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { deleteFromCloudinary } = require('../config/cloudinary');
const { Types } = require('mongoose'); // for ObjectId comparisons

let io;
let onlineUsers = new Map(); // userId -> socketId

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.query.token;
        if (!token) return next(new Error("No token provided"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = { userId: decoded.id };
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.user.userId;
        socket.join(`user:${userId}`);

        // Mark online
        await User.findByIdAndUpdate(userId, {
            is_online: 1,
            lastSeen: new Date(),
        });

        console.log("✅ Socket connected:", userId);

        // Join personal room
        socket.join(`user:${userId}`);

        // Track online users
        onlineUsers.set(userId, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

        // Mark all undelivered messages as delivered on connect
        try {
            const deliveredAt = new Date();

            // Find all conversations this user is part of
            const conversations = await Conversation.find({
                participants: new Types.ObjectId(userId)
            });
            const conversationIds = conversations.map(c => c._id);
            // Find all undelivered messages across all conversations
            const undeliveredMessages = await Message.find({
                conversationId: { $in: conversationIds },
                sender: { $ne: userId }, // not sent by this user
                deliveredTo: { $ne: userId }, // not yet delivered
            });

            if (undeliveredMessages.length > 0) {
                // Bulk update
                const userObjectId = new Types.ObjectId(userId);
                await Message.updateMany(
                    {
                        conversationId: { $in: conversationIds },
                        sender: { $ne: userObjectId },
                        deliveredTo: { $ne: userObjectId },
                    },
                    {
                        $addToSet: { deliveredTo: userObjectId },
                        $set: { deliveredAt },
                    }
                );

                // notify senders
                const senderIds = [...new Set(
                    undeliveredMessages.map(m => m.sender.toString())
                )];

                senderIds.forEach((senderId) => {
                    const senderConvIds = undeliveredMessages
                        .filter(m => m.sender.toString() === senderId)
                        .map(m => m.conversationId.toString());

                    io.to(`user:${senderId}`).emit("messagesDelivered", {
                        conversationIds: [...new Set(senderConvIds)],
                        deliveredAt,
                    });
                });
            }
        } catch (err) {
            console.error("Delivery on connect error:", err);
        }

        // JOIN CONVERSATION ROOM (with auth guard)
        socket.on("joinConversation", async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId, // verify user belongs here
                });

                if (!conversation) {
                    console.warn(`Unauthorized join attempt by ${userId} on ${conversationId}`);
                    return;
                }

                socket.join(conversationId);
                console.log(` ${userId} joined room: ${conversationId}`);
            } catch (err) {
                console.error("joinConversation error:", err);
            }
        });

        // LEAVE CONVERSATION ROOM
        socket.on("leaveConversation", (conversationId) => {
            socket.leave(conversationId);
            console.log(`${userId} left room: ${conversationId}`);
        });

        // SEND MESSAGE
        socket.on("sendMessage", async (data) => {
            try {
                const { conversationId, content, messageType = "text", file = null, tempId } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });
                if (!conversation) return;

                const receiverId = conversation.participants.find(
                    (id) => id.toString() !== userId
                );

                // Check if receiver is online right now
                const isReceiverOnline = onlineUsers.has(receiverId.toString());
                const deliveredAt = isReceiverOnline ? new Date() : null;

                const newMessage = await Message.create({
                    conversationId,
                    sender: userId,
                    content: content || "",
                    messageType,
                    file: file || {
                        url: "",
                        name: "",
                        size: 0,
                    },
                    seenBy: [userId],
                    deliveredTo: isReceiverOnline ? [receiverId] : [],
                    deliveredAt,
                });

                conversation.lastMessage = newMessage._id;
                await conversation.save();

                const populatedMessage = await newMessage.populate("sender", "name email");
                const SenderMessageToEmit = {
                    ...populatedMessage.toObject(),
                    conversationId: conversationId,
                    tempId, // include tempId for client-side reconciliation
                };
                const ReceiverMessageToEmit = {
                    ...populatedMessage.toObject(),
                    conversationId: conversationId,
                };

                io.to(`user:${receiverId}`).emit("receiveMessage", ReceiverMessageToEmit);
                io.to(`user:${userId}`).emit("receiveMessage", SenderMessageToEmit);

                // Notify sender about delivery if receiver was online
                if (isReceiverOnline) {
                    io.to(`user:${userId}`).emit("messagesDelivered", {
                        conversationIds: [conversationId],
                        deliveredAt,
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });

        // update the other client when messages are marked as read
        socket.on("markAsRead", async ({ conversationId }) => {
            const userId = socket.user.userId; // override with authenticated userId from token
            try {
                // auth guard
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });
                if (!conversation) return;
                const seenAt = new Date();

                await Message.updateMany(
                    {
                        conversationId,
                        seenBy: { $ne: userId },
                        sender: { $ne: userId }, // don't mark your own messages
                    },
                    {
                        $addToSet: { seenBy: userId },
                        $set: { seenAt },
                    }
                );

                // emit back to sender so their ticks update in real time
                const senderId = conversation.participants.find(
                    (id) => id.toString() !== userId
                );

                // Notify the other participant that messages were read and seen
                io.to(`user:${senderId}`).emit("messagesSeen", { conversationId, seenAt });
                socket.to(conversationId).emit("messagesRead", { conversationId, userId });
            } catch (err) {
                console.error("markAsRead socket error:", err);
            }
        });

        socket.on("typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("userTyping", { conversationId, userId });
        });

        socket.on("stopTyping", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("userStopTyping", { conversationId, userId });
        });

        // EDIT MESSAGE
        socket.on("editMessage", async ({ messageId, content }) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    sender: userId, // only sender can edit
                });
                if (!message) return;

                message.content = content;
                message.isEdited = true;
                await message.save();
                const populatedMessage = await message.populate("sender", "name email");

                // notify both users in the conversation room
                io.to(`user:${userId}`).emit("messageEdited", populatedMessage);
                socket.to(message.conversationId.toString()).emit("messageEdited", populatedMessage);
            } catch (err) {
                console.error("editMessage error:", err);
            }
        });

        // 🗑️ DELETE MESSAGE
        socket.on("deleteMessage", async ({ messageId }) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    sender: userId, // only sender can delete
                });
                if (!message) return;
                // If message has a file, delete from Cloudinary first
                if (message.file?.url) {
                    const resourceType =
                        message.messageType === 'video' ? 'video' :
                            message.messageType === 'file' ? 'raw' : 'image';

                    await deleteFromCloudinary(message.file.url, resourceType);
                }
                message.isDeleted = true;
                message.file = { url: '', name: '', size: 0 };
                await message.save();

                // notify both users
                io.to(`user:${userId}`).emit("messageDeleted", {
                    messageId,
                    conversationId: message.conversationId.toString(),
                });
                socket.to(message.conversationId.toString()).emit("messageDeleted", {
                    messageId,
                    conversationId: message.conversationId.toString(),
                });
            } catch (err) {
                console.error("deleteMessage error:", err);
            }
        });

        // DISCONNECT
        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", userId);

            User.findByIdAndUpdate(userId, {
                is_online: 0,
                lastSeen: new Date(),
            }).catch(console.error);

            onlineUsers.delete(userId);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });
    });
}

module.exports = { initSocket };