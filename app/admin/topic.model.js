import mongoose from "mongoose";

import Schema from "../db/Schema.js";
import { SKIN_TYPE, SKIN_CONCERN } from "../utils/enum.js";

const topicSchema = new Schema({
    text: {
        type: String,
        required: "The topic must be informed.",
    },
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
});

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
