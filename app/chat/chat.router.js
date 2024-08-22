import { Router } from "express";

import * as service from "./chat.service.js";
import { HTTP_STATUS } from "../utils/enum.js";

const router = new Router();

router.post("/", async (req, res, next) => {
    try {
        const chat = req.body;
        if (!chat.query) return res.status(HTTP_STATUS.BAD_REQUEST).send();

        res.header("Content-Type", "text/plain");
        const fnStream = function (message) {
            console.log(">> ", message);
            res.write(message);
        };

        const result = await service.startChat(chat, req.user, fnStream);
        console.log(result);
        res.write("result");
        res.send();
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

export default router;
