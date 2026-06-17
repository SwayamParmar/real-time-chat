// controllers/messageController.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Get messages with pagination
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const skip = (page - 1) * limit;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("sender", "name email");

        res.status(200).json({
            messages: messages.reverse(),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Store message (REST persistence)
exports.storeMessage = async (req, res) => {
    try {
        const { conversationId, content, messageType, file } = req.body;
        const senderId = req.user.id;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const newMessage = await Message.create({
            conversationId,
            sender: senderId,
            content,
            messageType,
            file,
            seenBy: [senderId]
        });

        // Update lastMessage in conversation
        conversation.lastMessage = newMessage._id;
        await conversation.save();
        const populatedMessage = await newMessage.populate('sender', 'name email');
        res.status(201).json({ message: populatedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error storing message' });
    }
};

// Mark all messages in a conversation as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            {
                conversationId,
                seenBy: { $ne: userId }  // only update if not already seen
            },
            {
                $addToSet: { seenBy: userId }
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to mark as read" });
    }
};