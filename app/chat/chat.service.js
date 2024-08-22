// import Chat from "./chat.model.js";
import OpenAI from "openai";
import { env } from "node:process";

import * as adminService from "../admin/admin.service.js";
import Chat from "./chat.model.js";

const openai = new OpenAI({
    apiKey: env["OPENAI_API_KEY"],
});

async function saveMessage(user, messages) {
    try {
        const userMsg = {
            content: messages.query,
            role: "user",
        };
        const assistantMsg = {
            content: messages.answer,
            role: "assistant",
        };
        const newChat = async () => {
            const chat = new Chat({
                user,
                title: messages.query.slice(0, 10),
                thread: messages.thread,
            });
            return await chat.save();
        };
        let chat = {};
        if (messages.isNew) {
            chat = await newChat();
        } else {
            chat = await Chat.findOne({ user, thread: messages.thread });
        }
        chat.message.push(userMsg, assistantMsg);
        return await chat.save();
    } catch (error) {
        console.log(error);
    }
}

async function createThread() {
    return await openai.beta.threads.create();
}

export async function startChat(chat, user, cbStream) {
    let assistantID = await adminService.retrieveAssistant();

    if (!chat.thread) {
        const { id } = await createThread();
        chat.thread = id;
        chat.isNew = 1;
    }

    const run = openai.beta.threads.runs
        .stream(chat.thread, {
            assistant_id: assistantID,
        })
        .on("textDelta", (message) => {
            cbStream(message.value);
        })
        .on("messageDone", (message) => {
            const result = saveMessage(user, {
                ...chat,
                answer: message.content[0].text.value,
            }).then(null, (result) => {
                console.log(result);
            });
            console.log(result);
        })
        .on("error", (error) => {
            console.log(error);
        });
    await run.finalMessages();
    return chat.thread;
}
