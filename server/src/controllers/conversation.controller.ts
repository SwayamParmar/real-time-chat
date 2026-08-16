import type { NextFunction, Request, Response } from "express";

import * as conversationService from "../services/conversation.service";

import type { StartConversationRequest } from "../types/start-conversation-request.type";

export const getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const conversations = await conversationService.getConversations(req.user!.userId);
        res.status(200).json({conversations});
    } catch (error) {
        next(error);
    }
};

export const startConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { receiverId } = req.body as StartConversationRequest;
        if (!receiverId) {
            res.status(400).json({ message: "Receiver required", });
            return;
        }
        const conversation = await conversationService.startConversation(
            req.user!.userId,
            receiverId
        );
        res.status(200).json({ conversation });
    } catch (error) {
        next(error);
    }
};
