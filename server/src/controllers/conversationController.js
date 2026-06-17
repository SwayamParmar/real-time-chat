// controllers/conversationController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get all conversations of logged-in user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'name email is_online lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name email' }
            })
            .sort({ updatedAt: -1 });

        // Attach unread count to each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: conv._id,
                    seenBy: { $ne: userId },
                    sender: { $ne: userId }  // don't count your own messages
                });
                return { ...conv.toObject(), unreadCount };
            })
        );

        res.status(200).json({ conversations: conversationsWithUnread });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load conversations.' });
    }
};


// Start or get existing conversation
exports.startConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver required" });
        }

        if (receiverId === userId) {
            return res.status(400).json({ message: "Cannot start conversation with yourself" });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        }).populate('participants', 'name email');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, receiverId]
            });
            conversation = await conversation.populate('participants', 'name email is_online lastSeen');
        }

        res.status(200).json({ conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to start conversation' });
    }
};