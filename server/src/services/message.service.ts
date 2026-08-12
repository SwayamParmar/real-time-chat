import { Types } from "mongoose";

import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

import type { MessageType } from "../enums/message-type.enum";
import type { MessageFile } from "../types/message-file.type";

interface StoreMessageData {
    conversationId: string;
    senderId: string;
    content?: string;
    messageType: MessageType;
    file?: MessageFile | null;
}

export const getMessages = async (
    conversationId: string,
    userId: string,
    page: number,
    limit: number
) => {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === userId
    );

    if (!isParticipant) {
        throw new Error("Unauthorized");
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
        conversationId: new Types.ObjectId(conversationId),
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name email");

    return messages.reverse();
};

export const storeMessage = async (data: StoreMessageData) => {
    const { conversationId, senderId, content, messageType, file } = data;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === senderId
    );

    if (!isParticipant) {
        throw new Error("Unauthorized");
    }

    const newMessage = await Message.create({
        conversationId,
        sender: senderId,
        content,
        messageType,
        file,
        seenBy: [senderId],
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    return newMessage.populate("sender", "name email");
};

export const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
    await Message.updateMany(
        {
            conversationId: new Types.ObjectId(conversationId),
            seenBy: {
                $ne: new Types.ObjectId(userId),
            },
        },
        {
            $addToSet: {
                seenBy: new Types.ObjectId(userId),
            },
        }
    );
};
