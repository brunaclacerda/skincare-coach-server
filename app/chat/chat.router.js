import { Router } from "express";

import * as service from "./chat.service.js";
import { HTTP_STATUS } from "../utils/enum.js";

const router = new Router();

router.post("/", async (req, res, next) => {
	try {
		const chat = req.body;
		if (!chat.query && !chat.id)
			return res.status(HTTP_STATUS.BAD_REQUEST).send();

		res.header("Content-Type", "text/plain");
		res.setHeader("Transfer-Encoding", "chunked");
		const fnStream = function (message, done) {
			res.write(message);
			if (done) res.end();
		};

		await service.startChat(chat, req.user, fnStream);
	} catch (error) {
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});

router.get("/", async (req, res, next) => {
	try {
		res.send(await service.get(req.user));
	} catch (error) {
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});
export default router;
