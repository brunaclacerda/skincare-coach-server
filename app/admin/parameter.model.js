import mongoose from "mongoose";

import Schema from "../db/Schema.js";

const parameterSchema = new Schema({
    chatbot: {
        type: {
            welcomeMsg: {
                type: String,
                required: "Message must be informed.",
            },
            assistantID: String,
        },
    },
});

const Parameter = new mongoose.model("Parameter", parameterSchema);

export default Parameter;
