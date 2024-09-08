import OpenAI from "openai";
import { env } from "node:process";

import Parameter from "./parameter.model.js";
import Topic from "./topic.model.js";
import { TOPIC_STATUS } from "../utils/enum.js";

const openai = new OpenAI({
	apiKey: env["OPENAI_API_KEY"],
});

const UPDATE_OPT = {
	returnDocument: "before",
	runValidators: true,
};

export async function updateParameters(update) {
	const chatbot = await getParameters();
	if (chatbot.length)
		return await Parameter.findByIdAndUpdate(chatbot[0]._id, update);
	return await Parameter.create(update);
}

export async function getParameters() {
	return await Parameter.find();
}

export async function newTopic(input) {
	return await Topic.insertMany(input);
}

export async function updateTopic(id, update) {
	return await Topic.findByIdAndUpdate(id, update, UPDATE_OPT);
}

export async function deleteTopic(id) {
	return await Topic.findByIdAndDelete(id);
}

export async function getTopic(id) {
	if (id) return await Topic.findById(id);
	return await Topic.find();
}

export async function distributeTopic(input) {
	const topic = await Topic.findById(input);
	if (!topic) throw new Error("Topic not found!");
	const result = await topic.distribute();
	if (!result) throw new Error("Operation failed");
	console.log(result);
	topic.status = TOPIC_STATUS.DISTRIBUTED;

	await topic.save();
	return result;
}

async function createAssitant() {
	const assistant = await openai.beta.assistants.create({
		model: "gpt-4o-mini",
		name: "Skincare coach",
		// instructions: "You are a personal skincare coach. ",
		instructions: "Answer with just a greeting. No more than 2 words.",
	});
	await Parameter.updateOne({}, { chatbot: { assistantID: assistant.id } });
	return assistant.id;
}

export async function retrieveAssistant() {
	let { chatbot } = await Parameter.findOne(null, "chatbot");
	if (!chatbot || !chatbot.assistantID) return await createAssitant();
	return chatbot.assistantID;
}
