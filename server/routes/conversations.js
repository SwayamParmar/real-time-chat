const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');

// Protected route to fetch conversations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.userId; // Extract the logged-in user's ID from the middleware

        // Fetch conversations where the user is either the sender or the receiver
        const conversations = await Conversation.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        })
        .sort({ updated_at: -1 }) // Sort by the most recently updated conversation
        .populate('sender', 'name email') // Populate sender details (optional)
        .populate('receiver', 'name email'); // Populate receiver details (optional)

        res.status(200).json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to load conversations.' });
    }
});

// API to start a new conversation
router.post('/start', authMiddleware, async (req, res) => {
    const { sender, receiver } = req.body;

    try {
        // Step 1: Check if the conversation already exists
        let conversation = await Conversation.findOne({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).populate('sender receiver', 'name'); // Populate sender and receiver names

        // Step 2: If no conversation exists, create a new one
        if (!conversation) {
            conversation = new Conversation({ 
                sender, 
                receiver,
                content: ''
            });

            // Save the conversation
            await conversation.save();

            // Populate sender and receiver details after saving
            conversation = await conversation.populate('sender receiver', 'name');
        }

        // Step 3: Send the conversation (existing or new) as the response
        res.status(200).json({ conversation });
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ message: 'Failed to start conversation' });
    }
});

module.exports = router;
