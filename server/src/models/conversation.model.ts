import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export interface Conversation extends Document {
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
}

const conversationSchema = new Schema<Conversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    { timestamps: true }
);

// Prevent duplicate conversations between same 2 users
conversationSchema.index({ participants: 1 });

const Conversation: Model<Conversation> = mongoose.model<Conversation>(
    'Conversation',
    conversationSchema
);

export default Conversation;