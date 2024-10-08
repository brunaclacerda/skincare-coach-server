import mongoose from "mongoose";

import { Schema } from "mongoose";
import { CHAT_STATUS } from "../utils/enum.js";

const messageSchema = new Schema(
	{
		content: String,
		role: String,
		aiMsgId: String,
	},
	{ timestamps: true }
);
const chatSchema = new Schema(
	{
		title: {
			type: String,
			default: function () {
				if (!this.title && this.message[0]) {
					return this.message[0].content.substring(0, 30);
				}
			},
		},
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
		status: {
			type: Number,
			default: CHAT_STATUS.READ,
		},
	},
	{ timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
