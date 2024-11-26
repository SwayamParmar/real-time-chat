const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        message_type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
        is_deleted: { type: Boolean, default: false },
        is_edited: { type: Boolean, default: false },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
