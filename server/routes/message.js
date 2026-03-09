const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// Fetch messages by conversation ID
router.get("/:conversationId", authMiddleware, messageController.getMessages);
router.post('/storeMessage', authMiddleware, messageController.storeMessage);
router.put('/read/:conversationId', authMiddleware, messageController.markAsRead);

module.exports = router;