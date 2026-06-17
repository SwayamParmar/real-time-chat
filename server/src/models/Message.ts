import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Union type for messageType — discriminated union foundation
export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface MessageFile {
    url: string;
    name: string;
    size: number;
}

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    content?: string;
    messageType: MessageType;
    file: MessageFile;
    seenBy: Types.ObjectId[];
    seenAt: Date | null;
    isDeleted: boolean;
    isEdited: boolean;
    deliveredTo: Types.ObjectId[];
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video', 'file'],
            default: 'text',
        },
        file: {
            url: { type: String, default: '' },
            name: { type: String, default: '' },
            size: { type: Number, default: 0 },
        },
        seenBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
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
            { type: Schema.Types.ObjectId, ref: 'User' },
        ],
        deliveredAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Important index for fast pagination
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

export default Message;