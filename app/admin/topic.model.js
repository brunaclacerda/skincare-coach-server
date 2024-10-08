import mongoose from "mongoose";

import Schema from "../db/Schema.js";
import {
	SKIN_TYPE,
	SKIN_CONCERN,
	TOPIC_STATUS,
	CHAT_STATUS,
} from "../utils/enum.js";
import User from "../user/user.model.js";
import Chat from "../chat/chat.model.js";
const topicSchema = new Schema(
	{
		text: {
			type: [String],

			required: "The topic must be informed.",
		},
		title: String,
		aiContent: String,
		button: String,
		criteria: {
			skinType: {
				type: String,
				enum: SKIN_TYPE,
			},
			concern: {
				type: [
					{
						type: String,
						enum: SKIN_CONCERN,
					},
				],
			},
		},
		status: {
			type: Number,
			default: TOPIC_STATUS.CREATED,
			enum: TOPIC_STATUS,
		},
		distDate: Date,
		distUntil: Date,
	},
	{
		timestamps: true,
	}
);

topicSchema.methods.distribute = async function () {
	const topic = this;
	const users = await User.findActiveUsers(this.criteria);
	if (!users) return;
	const insertQuery = users.map((user) => {
		return {
			user: user._id,
			topic: topic._id,
			status: CHAT_STATUS.UNREAD,
			title: topic.title,
			message: topic.text.map((text) => {
				return { content: text, role: "admin" };
			}),
		};
	});
	const insertResult = await Chat.insertMany(insertQuery);
	return insertResult;
};
const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
