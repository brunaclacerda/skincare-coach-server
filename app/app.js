import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import createError from "http-errors";
import session from "express-session";
import passport from "passport";
import { env } from "node:process";

import userRouter from "./user/user.router.js";
import surveyRouter from "./survey/survey.router.js";
import errorHandler from "./middleware/error.js";
import mongoose from "./db/mongoose.js";
import DBStore from "./db/session.js";

mongoose().catch((err) => console.log(err));

const MINUTE = 6000;

const app = express();

app.use(
    session({
        secret: env.SESSION_SECRET,
        cookie: {
            maxAge: MINUTE * 30,
        },
        store: DBStore(session),
        resave: true,
        saveUninitialized: false,
        unset: "destroy",
    })
);
app.use(passport.authenticate("session"));
app.use(helmet());
app.use(express.json());

app.disable("x-powered-by");

/* Morgan settings */
morgan.token("error", (req, res) => {
    return res.locals.message;
});
app.use(
    morgan(
        ":method :url :status :response-time ms - :res[content-length] :error",
        {
            skip: function (req, res) {
                return res.statusCode < 400;
            },
        }
    )
);

app.use("/user", userRouter);
app.use("/survey", surveyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(errorHandler);

export default app;
