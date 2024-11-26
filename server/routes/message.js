// In your backend (e.g., `messages.js` route)

const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const authMiddleware = require('../middleware/authMiddleware');

// Fetch messages by conversation ID
router.get("/:conversationId", authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        // Fetch all messages for the selected conversation
        const messages = await Message.find({ conversationId })
        .sort({ created_at: 1 }) // Ensure messages are sorted by creation time
        .populate("sender", "name email") // Populating sender's info
        .populate("receiver", "name email"); // Populating receiver's info

        res.status(200).json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// Store a new message
router.post('/storeMessage', authMiddleware, async (req, res) => {
    const { conversationId, sender, receiver, content } = req.body;

    if (!conversationId || !sender || !receiver || !content) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Create the new message
        const newMessage = new Message({
            conversationId,
            sender,
            receiver,
            content,
            created_at: new Date(),
        });

        // Save the message to the database
        const savedMessage = await newMessage.save();

        // Update the last message in the conversation
        await Conversation.findByIdAndUpdate(
            conversationId,
            { content: content, updated_at: new Date() },
            { new: true }
        );

        // Respond with the saved message
        res.status(201).json({ message: savedMessage });
    } catch (err) {
        console.error('Error storing message:', err);
        res.status(500).json({ message: "Error storing message" });
    }
});

module.exports = router;