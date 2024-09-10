import express from "express";
import { nextTick } from "node:process";
import passport from "passport";
import LocalStrategy from "passport-local";

import * as service from "./user.service.js";
import auth from "../middleware/auth.js";
import { HTTP_STATUS } from "../utils/enum.js";

passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		service.verify
	)
);

passport.serializeUser(function (user, cb) {
	nextTick(function () {
		cb(null, { id: user._id, email: user.email });
	});
});

passport.deserializeUser(function (user, cb) {
	nextTick(function () {
		return cb(null, user);
	});
});

const router = express.Router();

router.post(
	"/login",
	passport.authenticate("local", { failWithError: true }),
	(req, res) => {
		const resUser = {
			name: req.user.name,
			firstLogin: req.user.firstLogin,
			isNew: req.user.firstLogin ? false : true,
		};
		console.log(resUser);
		res.send({
			user: resUser,
		});
	}
);

router.post("/signup", async (req, res, next) => {
	try {
		if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

		const user = await service.newUser(req.body);
		res.status(HTTP_STATUS.CREATED).send(user);
	} catch (error) {
		console.log(error);
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});

router.post("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.send();
		//   res.redirect('/');
	});
});

router.patch("/me", auth, async (req, res, next) => {
	try {
		if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

		const user = await service.updateUser(req.body, req.user);
		res.status(HTTP_STATUS.OK).send(user);
	} catch (error) {
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});

router.get("/me", auth, async (req, res, next) => {
	try {
		const user = await service.me(req.user);
		res.status(HTTP_STATUS.OK).send(await service.createChats(user));
	} catch (error) {
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});

router.post("/survey", auth, async (req, res, next) => {
	try {
		if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();
		console.log(req.body);
		res.send(await service.newUserSurvey(req.body, req.user));
	} catch (error) {
		next({
			message: error.message,
			status: HTTP_STATUS.BAD_REQUEST,
			cause: error,
		});
	}
});

export default router;
