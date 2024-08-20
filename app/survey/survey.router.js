import express from "express";

import * as service from "./survey.service.js";
import auth from "../middleware/auth.js";
import { HTTP_STATUS } from "../utils/enum.js";

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(HTTP_STATUS.BAD_REQUEST).send();
        }
        res.send(await service.insert(req.body));
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.get("/", auth, async (req, res, next) => {
    try {
        res.send(await service.getAll());
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

export default router;
