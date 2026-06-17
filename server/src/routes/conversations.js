const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const conversationController = require('../controllers/conversationController');

// Protected route to fetch conversations
router.get('/', authMiddleware, conversationController.getConversations);
router.post('/start', authMiddleware, conversationController.startConversation);

module.exports = router;