import mongoose from "mongoose";

import { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        content: String,
        role: String,
    },
    { timestamps: true }
);
const chatSchema = new Schema(
    {
        title: String,
        message: [messageSchema],
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
        },
        thread: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
