import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    Response,
} from "express";

const errorHandler: ErrorRequestHandler = (
    err,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    console.error(err.stack);

    const statusCode =
        "statusCode" in err && typeof err.statusCode === "number"
            ? err.statusCode
            : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorHandler;