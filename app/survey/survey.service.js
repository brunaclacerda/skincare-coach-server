import Survey from "./survey.model.js";

export async function insert(input) {
    return await Survey.insertMany(input);
}

export async function getAll() {
    return await Survey.find();
}
