// getting-started.js
import mongoose from "mongoose";
import env from "node:process";

async function main() {
    await mongoose.connect(env.MONGO_URI);
}

export default main;
