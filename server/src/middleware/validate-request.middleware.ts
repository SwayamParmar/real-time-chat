import type { NextFunction, Request, Response, } from "express";
import { validationResult } from "express-validator";

const validateRequest = ( req: Request, res: Response, next: NextFunction, ): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const details = errors.array();

        res.status(400).json({
            message: details[0]?.msg ?? "Invalid request.",
            errors: details,
        });
        return;
    }

    next();
};

export default validateRequest;