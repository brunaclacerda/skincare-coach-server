import { env } from "node:process";

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    res.locals.message = err.message;
    res.locals.error = env.NODE_ENV === "dev" ? err : {};

    res.status(err.status || 500);
    res.send(err.message);
}
