import type { JwtPayload } from "./jwt-payload.type";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export {};