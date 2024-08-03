import app from "./app.js";
import { env } from "node:process";

const port = env.PORT;

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
