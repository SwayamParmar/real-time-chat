/**
 * An Error that carries the HTTP status the API should answer with.
 *
 * Services threw bare `Error`s, which the global error handler can only treat
 * as a 500 — so "email already registered" and "invalid password" reached the
 * client indistinguishable from a crash. Anything thrown without a statusCode
 * still falls through as a 500, so this is additive.
 */
export class HttpError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}
