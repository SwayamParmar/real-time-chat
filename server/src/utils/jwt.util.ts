import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload } from "../types/jwt-payload.type";

export const generateToken = (userId: string): string => {
    return jwt.sign(
        {
            userId,
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
        },
    );
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};