const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        content: {
            type: String,
            trim: true
        },

        messageType: {
            type: String,
            enum: ['text', 'image', 'video', 'file'],
            default: 'text'
        },

        file: {
            url: { type: String, default: '' },
            name: { type: String, default: '' },
            size: { type: Number, default: 0 }
        },

        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        seenAt: {
            type: Date,
            default: null
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        isEdited: {
            type: Boolean,
            default: false
        },
        deliveredTo: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        ],
        deliveredAt: { type: Date, default: null }
    },
    { timestamps: true }
);

/**
 * Important Index for fast pagination
 */
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);