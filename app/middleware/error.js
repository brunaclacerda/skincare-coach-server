import { env } from "node:process";
import { HTTP_STATUS } from "../utils/enum.js";

export default function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const http_status =
        !req.session.passport || !req.session.passport.user
            ? HTTP_STATUS.UNAUTHORIZED
            : HTTP_STATUS.BAD_REQUEST;

    res.locals.message = err.message;
    res.locals.error =
        env.NODE_ENV === "dev" ? (err.cause ? err.cause : err) : {};
    console.log("err");
    res.status(err.status || http_status);
    res.send({ failureMsg: err.message });
}
