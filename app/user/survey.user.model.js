import mongoose from "mongoose";

import Schema from "../db/Schema.js";

const answerSchema = {
    _id: "ObjectId",
    text: String,
    value: String,
    analysis: String,
};

const questionSchema = {
    _id: "ObjectId",
    text: String,
    answer: {
        type: [answerSchema],
        validate(section) {
            if (!section.length)
                throw new Error("At least one answer must be informed.");
        },
    },
};

const userSurveySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
    },
    section: {
        type: [
            {
                _id: "ObjectId",
                text: String,
                question: {
                    type: [questionSchema],
                    validate(section) {
                        if (!section.length)
                            throw new Error(
                                "At least one question must be informed."
                            );
                    },
                },
            },
        ],
        validate(section) {
            if (!section.length) throw new Error("Section not informed");
        },
    },
});

const UserSurvey = mongoose.model("UserSurvey", userSurveySchema);
export default UserSurvey;
