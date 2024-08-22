import express from "express";
import * as service from "./admin.service.js";
import { HTTP_STATUS } from "../utils/enum.js";

const router = new express.Router();

router.get("/parameters/", async (req, res, next) => {
    try {
        res.send(service.getParameters());
    } catch (error) {
        next({
            message: error.message,
            status: 201,
            cause: error,
        });
    }
});

router.post("/parameters/", async (req, res, next) => {
    try {
        if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();
        await service.updateParameters(req.body);
        res.send();
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.post("/topic", async (req, res, next) => {
    try {
        if (!Object.keys(req.body).length)
            return res.status(HTTP_STATUS.BAD_REQUEST).send();
        const topic = await service.newTopic(req.body);
        return res.status(HTTP_STATUS.CREATED).send(topic);
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.get("/topic/:id", async (req, res, next) => {
    try {
        const topic = await service.getTopic(req.params.id);
        return res.send(topic);
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.get("/topic", async (req, res, next) => {
    try {
        const topic = await service.getTopic();
        return res.send(topic);
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.patch("/topic/:id", async (req, res, next) => {
    try {
        if (!Object.keys(req.body).length)
            return res.status(HTTP_STATUS.BAD_REQUEST).send();
        const topic = await service.updateTopic(req.params.id, req.body);
        if (!topic) res.status(HTTP_STATUS.NOT_FOUND);
        return res.send(topic);
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

router.delete("/topic/:id", async (req, res, next) => {
    try {
        const topic = await service.deleteTopic(req.params.id);
        if (!topic) res.status(HTTP_STATUS.NOT_FOUND);
        return res.send();
    } catch (error) {
        next({
            message: error.message,
            status: HTTP_STATUS.BAD_REQUEST,
            cause: error,
        });
    }
});

export default router;
