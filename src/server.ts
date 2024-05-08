import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("Mongoose Connected");
    app.listen(env.PORT, () => {
      console.log("Server started on " + env.PORT);
    });
  })
  .catch(console.error);
