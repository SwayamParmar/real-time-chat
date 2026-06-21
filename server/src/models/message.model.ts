import mongoose, { Schema, type Document, type Model } from "mongoose";
import { MessageType } from "../enums/message-type.enum";
import type { MessageFile } from "../types/message-file.type";
import type { Types } from "mongoose";

export interface Message extends Document {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;

    content: string;

    messageType: MessageType;

    file: MessageFile;

    seenBy: Types.ObjectId[];
    seenAt: Date | null;

    deliveredTo: Types.ObjectId[];
    deliveredAt: Date | null;

    isDeleted: boolean;
    isEdited: boolean;
}

const messageSchema = new Schema<Message>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            trim: true,
        },

        messageType: {
            type: String,
            enum: Object.values(MessageType),
            default: MessageType.TEXT,
        },

        file: {
            url: {
                type: String,
                default: "",
            },

            name: {
                type: String,
                default: "",
            },

            size: {
                type: Number,
                default: 0,
            },
        },

        seenBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        seenAt: {
            type: Date,
            default: null,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        isEdited: {
            type: Boolean,
            default: false,
        },

        deliveredTo: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        deliveredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

/**
 * Index for fast pagination
 */
messageSchema.index({
    conversationId: 1,
    createdAt: -1,
});

const Message: Model<Message> = mongoose.model<Message>(
    "Message",
    messageSchema,
);

export default Message;