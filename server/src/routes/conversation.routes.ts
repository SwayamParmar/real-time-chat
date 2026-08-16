import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import * as conversationController from "../controllers/conversation.controller";

const router = Router();

/**
 * Get conversations for the authenticated user
 */
router.get("/", authMiddleware, conversationController.getConversations);

/**
 * Start a new conversation
 */
router.post("/start", authMiddleware, conversationController.startConversation);

export default router;