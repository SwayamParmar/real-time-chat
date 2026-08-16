import type { NextFunction, Request, Response } from "express";
import * as messageService from "../services/message.service";

export const getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { conversationId } = req.params;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const messages = await messageService.getMessages(
            conversationId,
            req.user!.userId,
            page,
            limit
        );

        res.status(200).json({
            messages,
        });
    } catch (error) {
        next(error);
    }
};

export const storeMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { conversationId, content, messageType, file } = req.body;

        const message = await messageService.storeMessage({
            conversationId,
            senderId: req.user!.userId,
            content,
            messageType,
            file,
        });

        res.status(201).json({
            message,
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { conversationId } = req.params;
        await messageService.markAsRead(conversationId, req.user!.userId);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
