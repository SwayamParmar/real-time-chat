import { JsonWebTokenError, TokenExpiredError,} from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/jwt.util";

const authMiddleware = ( req: Request, res: Response, next: NextFunction ): void => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Invalid or missing Authorization header." });
            return;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Malformed token." });
            return;
        }

        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        if (error instanceof TokenExpiredError) {
            res.status(401).json({ message: "Token expired. Please login again." });
            return;
        }

        if (error instanceof JsonWebTokenError) {
            res.status(400).json({ message: "Invalid token." });
            return;
        }

        res.status(500).json({ message: "Internal server error." });
    }
};

export default authMiddleware;