import { Types } from "mongoose";

import Conversation from "../models/conversation.model";
import Message from "../models/message.model";

export const getConversations = async (userId: string) => {
    const conversations = await Conversation.find({
        participants: new Types.ObjectId(userId),
    })
        .populate("participants", "name email is_online lastSeen")
        .populate({
            path: "lastMessage",
            populate: {
                path: "sender",
                select: "name email",
            },
        })
        .sort({
            updatedAt: -1,
        });

    const conversationsWithUnread = await Promise.all(
        conversations.map(async (conversation) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conversation._id,
                seenBy: {
                    $ne: new Types.ObjectId(userId),
                },
                sender: {
                    $ne: new Types.ObjectId(userId),
                },
            });

            return {
                ...conversation.toObject(),
                unreadCount,
            };
        })
    );

    return conversationsWithUnread;
};

export const startConversation = async (userId: string, receiverId: string) => {
    const currentUserId = new Types.ObjectId(userId);
    const receiverObjectId = new Types.ObjectId(receiverId);

    if (receiverId === userId) {
        throw new Error("Cannot start conversation with yourself.");
    }

    let conversation = await Conversation.findOne({
        participants: {
            $all: [currentUserId, receiverObjectId],
        },
    }).populate("participants", "name email is_online lastSeen");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [currentUserId, receiverObjectId],
        });

        conversation = await conversation.populate("participants", "name email is_online lastSeen");
    }

    return conversation;
};
