const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Message content
    content: { type: String }, // Message text or caption for media
    message_type: {
        type: String,
        enum: ['text', 'image', 'pdf', 'video', 'audio', 'other'],
        default: 'text',
    },
    
    // File information (only used if message_type is not 'text')
    file_name: { type: String, default: '' }, // For displaying file name in UI
    file_size: { type: String, default: '' }, // File size in a human-readable format (e.g., "50.7KB")
    file_url: { type: String, default: '' },  // URL for uploaded files (if any)
    
    // Status tracking
    status: { type: Number, enum: [0, 1], default: 0 }, // 0: Unread, 1: Read
    is_edited: { type: Boolean, default: false },       // Indicates if message has been edited
    is_deleted: { type: Boolean, default: false },      // Soft delete for messages
    // Reactions (optional but simple for one-to-one)
    reactions: [{
        type: { type: String, enum: ['like', 'love', 'laugh', 'sad', 'angry'], default: 'like' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    
    // Timestamp fields
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }, // Only populated if the message is edited
});

conversationSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        this.updated_at = new Date();
    }
    next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;