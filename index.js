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

import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 6666;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

const corsOption = {
  origin: ["https://pollverse-frontend.vercel.app", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};
  app.use(cors(corsOption));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true,
// };

// app.use(cors(corsOptions));

app.use(cookieParser());

app.use("/activity", activityRouter);
app.use("/chat", chatRouter);
app.use("/comment", commentRouter);
app.use("/notification", notificationRouter);
app.use("/post", postRouter);
app.use("/transaction", transactionRouter);
app.use("/user", userRouter);
app.use("/profanity", profanityRouter);
app.use("/search", searchRouter);
app.use('/', (req,res)=>{
  console.log("logged a visit to backslash");
  res.send("hello!");
})

// app.listen(PORT, () => {
//   console.log(`running on port: ${PORT}`);
//   if (PORT === 6666) {
//     console.log(
//       "ERROR: issue reading port from process.env. Continue with caution! ..."
//     );
//   }
// });

// const SOCKET_PORT = process.env.SOCKET_PORT;

const server = http.createServer(app); // create an HTTP server using express app
const io = new Server(server, {
  cors: process.env.FRONT_END_PATH,
});

io.on("connection", (socket) => {
  console.log(`A User connected!`);

  socket.on("message", (data, room) => {
    socket.to(room).emit("message", data, room);
    console.log("message data :", data, room);
  });

  socket.on("joinRoom", (name, roomId) => {
    socket.join(roomId);
    console.log(`${name} has joined room: `, roomId);
  });
});

// io.listen(SOCKET_PORT);
server.listen(PORT, () => {
  connect();

  console.log(`Server is listeningon port ${PORT}`);
});


//"https://pollverse-frontend.vercel.app"