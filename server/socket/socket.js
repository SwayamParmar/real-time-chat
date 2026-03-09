const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

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

        // ✅ LEAVE CONVERSATION ROOM
        socket.on("leaveConversation", (conversationId) => {
            socket.leave(conversationId);
            console.log(`${userId} left room: ${conversationId}`);
        });

        // SEND MESSAGE
        socket.on("sendMessage", async (data) => {
            try {
                const { conversationId, content, messageType, file } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId, // auth guard
                });
                if (!conversation) return;

                const newMessage = await Message.create({
                    conversationId,
                    sender: userId,
                    content,
                    messageType,
                    file,
                    seenBy: [userId],
                });

                conversation.lastMessage = newMessage._id;
                await conversation.save();

                const populatedMessage = await newMessage.populate("sender", "name email");

                // Find receiver
                const receiverId = conversation.participants.find(
                    (id) => id.toString() !== userId
                );

                // ensure conversationId stays as a plain string
                const messageToEmit = {
                    ...populatedMessage.toObject(),
                    conversationId: conversationId, // plain string, not populated object
                };

                io.to(`user:${receiverId}`).emit("receiveMessage", messageToEmit);
                io.to(`user:${userId}`).emit("receiveMessage", messageToEmit);

            } catch (err) {
                console.error(err);
            }
        });

        // MARK AS SEEN
        socket.on("markSeen", async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    {
                        conversationId,
                        seenBy: { $ne: userId },
                    },
                    {
                        $push: { seenBy: userId },
                    }
                );

                const conversation = await Conversation.findById(conversationId);

                const receiverId = conversation.participants.find(
                    (id) => id.toString() !== userId
                );

                io.to(`user:${receiverId}`).emit("messageSeen", {
                    conversationId,
                });
            } catch (err) {
                console.error(err);
            }
        });

        // update the other client when messages are marked as read
        socket.on("markAsRead", async ({ conversationId, userId }) => {
            try {
                // auth guard
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });
                if (!conversation) return;

                await Message.updateMany(
                    { conversationId, seenBy: { $ne: userId } },
                    { $addToSet: { seenBy: userId } }
                );

                // Notify the other participant that messages were read
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

        // ❌ DISCONNECT
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