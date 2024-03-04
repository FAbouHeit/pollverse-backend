import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./Config/Mongo.Config.js";
import cookieParser from "cookie-parser";
dotenv.config();

import activityRouter from "./Routes/Activity.Routes.js";
import chatRouter from "./Routes/Chat.Routes.js";
import commentRouter from "./Routes/Comment.Routes.js";
import notificationRouter from "./Routes/Notifications.Routes.js";
import postRouter from "./Routes/Post.Routes.js";
import transactionRouter from "./Routes/Transaction.Routes.js";
import userRouter from "./Routes/User.Routes.js";
import profanityRouter from "./Routes/Profanity.Router.js";
import searchRouter from "./Routes/Search.Routes.js";

const PORT = process.env.PORT || 6666;
const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const corsOption = {
  origin: process.env.FRONT_END_PATH,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(cors(corsOption));

app.use("/activity", activityRouter);
app.use("/chat", chatRouter);
app.use("/comment", commentRouter);
app.use("/notification", notificationRouter);
app.use("/post", postRouter);
app.use("/transaction", transactionRouter);
app.use("/user", userRouter);
app.use("/profanity", profanityRouter);
app.use("/search", searchRouter);

app.listen(PORT, () => {
  connect();
  console.log(`running on port: ${PORT}`);
  if (PORT === 6666) {
    console.log(
      "ERROR: issue reading port from process.env. Continue with caution! ..."
    );
  }
});

//add socket io
//add authentication, authorization
//add node mailer
