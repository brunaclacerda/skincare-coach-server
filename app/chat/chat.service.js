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
			aiMsgId: messages.messageId.id,
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
			chat = await Chat.findById(messages.id);
		}
		if (!chat.thread) chat.thread = messages.thread;
		if (messages.role !== "admin") chat.message.push(userMsg);
		chat.message.push(assistantMsg);
		return await chat.save();
	} catch (error) {
		console.log(error);
	}
}

async function createThread() {
	return await openai.beta.threads.create();
}

async function createMessage(thread, role, content) {
	return await openai.beta.threads.messages.create(thread, {
		role,
		content,
	});
}

export async function startChat(chat, user, cbStream) {
	let assistantID = await adminService.retrieveAssistant();

	if (chat.id) {
		const chatData = await Chat.findOne({
			_id: chat.id,
			user: user,
		}).populate("topic", "aiContent");
		if (!chatData) throw new Error("Chat informed not found!");
		if (chatData.thread) {
			chat.thread = chatData.thread;
		}
		// aiContent is sent just in the first interaction
		if (chatData.topic && !chat.thread) {
			if (chatData.topic.aiContent) {
				chat.query = chatData.topic.aiContent;
				chat.role = "admin";
			}
		}
	} else {
		chat.isNew = 1;
	}
	if (!chat.query) throw new Error("Query not informed!");

	if (!chat.thread) {
		const { id } = await createThread();
		chat.thread = id;
	}

	chat.messageId = await createMessage(chat.thread, "user", chat.query);

	const run = openai.beta.threads.runs
		.stream(chat.thread, {
			assistant_id: assistantID,
		})
		.on("textDelta", (message) => {
			cbStream(message.value);
		})
		.on("messageDone", (message) => {
			saveMessage(user, {
				...chat,
				answer: message.content[0].text.value,
			}).then(
				(chat) => {
					if (chat?._id) cbStream("<<chat_id=" + chat._id, true);
				},
				(result) => {
					console.log(result);
				}
			);
		})
		.on("error", (error) => {
			console.log(error);
		});
	await run.finalMessages();
	return;
}

export async function get(user) {
	const chats = await Chat.find({ user: user }).populate("topic");
	return chats;
}
