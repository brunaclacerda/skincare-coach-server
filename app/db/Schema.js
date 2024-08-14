import { Schema } from "mongoose";

class MySchema extends Schema {
    constructor(obj) {
        const newSchema = super(obj);

        //Error Handling Middleware
        newSchema.post("save", function (error, doc, next) {
            if (error.name === "MongoServerError" && error.code === 11000) {
                return next(
                    new Error(
                        Object.keys(error.keyValue)[0] +
                            ": There was a duplicate key error"
                    )
                );
            }
            if (error.name == "ValidationError") {
                const arMessages = Object.keys(error.errors).map(
                    (key) => error.errors[key].message
                );
                return next(new Error(arMessages.join(" ")));
            }
        });

        return newSchema;
    }
}

export default MySchema;
