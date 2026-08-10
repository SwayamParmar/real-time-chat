import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import * as messageController from "../controllers/message.controller";

const router = Router();

/**
 * Fetch messages by conversation ID
 */
router.get("/:conversationId", authMiddleware, messageController.getMessages);

/**
 * Store a new message
 */
router.post("/storeMessage", authMiddleware, messageController.storeMessage);

/**
 * Mark messages as read
 */
router.put("/read/:conversationId", authMiddleware, messageController.markAsRead);

export default router;
