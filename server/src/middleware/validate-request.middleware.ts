import type { NextFunction, Request, Response, } from "express";
import { validationResult } from "express-validator";

const validateRequest = ( req: Request, res: Response, next: NextFunction, ): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const details = errors.array();

        /*
         * `message` alongside the array: every client reads `data.message` to
         * decide what to show, so a validation failure used to surface as a
         * generic "something went wrong" while the real reason sat unread in
         * `errors`. The array is untouched for anything that wants the detail.
         */
        res.status(400).json({
            message: details[0]?.msg ?? "Invalid request.",
            errors: details,
        });
        return;
    }

    next();
};

export default validateRequest;