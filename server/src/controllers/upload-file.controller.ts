import type { NextFunction, Request, Response } from "express";
import * as uploadFileService from "../services/upload-file.service";

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                message: "No file provided",
            });
            return;
        }

        const result = await uploadFileService.uploadFile(req.file);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
