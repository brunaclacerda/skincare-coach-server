import mongoose from "mongoose";
// import validator from "validator";

import { Schema } from "mongoose";

const answerSchema = {
    text: {
        type: String,
        required: "Answer text must me informed",
    },
    value: {
        type: String,
        required: "Inform answer value",
    },
    analysis: String,
};

const optionSchema = {
    minAnswer: {
        type: Number,
        default: 1,
    },
    maxAnswer: {
        type: Number,
        default: 1,
    },
    required: {
        type: Boolean,
        default: false,
    },
};

const questionSchema = {
    text: {
        type: String,
        required: "Question text must me informed",
    },
    answer: {
        type: [answerSchema],
        validate(answer) {
            if (!answer.length || answer.length < 2)
                throw new Error("At 2 answers needs to be informed ");
        },
    },
    option: optionSchema,
};

const surveySchema = new Schema({
    section: {
        type: String,
        required: "Section not informed",
    },
    question: {
        type: [questionSchema],
        required: "At least one question must be informed.",
    },
});

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
