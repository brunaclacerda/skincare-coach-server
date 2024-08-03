import express from "express";
import morgan from "morgan";
import createError from "http-errors";

import errorHandler from "./middleware/error.js";
import router from "./router.js";

import mongoose from "./db/mongoose.js";
mongoose().catch((err) => console.log(err));

const app = express();

app.disable("x-powered-by");

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

app.use(express.json());

app.use(router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(errorHandler);

export default app;
