import ConnectMongoDBSession from "connect-mongodb-session";
import { env } from "node:process";

export default function DBStore(session) {
    const MongoDBStore = ConnectMongoDBSession(session);
    let store = new MongoDBStore({
        uri: env.DB_SESSION_URI,
        collection: "mySessions",
    });

    // Catch errors
    store.on("error", function (error) {
        console.log(error);
    });
    store.on("save", function (error) {
        console.log(error);
    });
}
