// getting-started.js
import mongoose from "mongoose";
import { env } from "node:process";

export default async function () {
    try {
        await mongoose.connect(env.MONGO_URI);
    } catch (error) {
        console.log(error);
    }
}
