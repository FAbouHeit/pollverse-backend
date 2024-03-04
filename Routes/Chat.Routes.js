import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
    sendMessage,
    deleteMessagesByRoomId,
    getChat,
} from "../Controllers/Chat.Controller.js";

  
  const chatRouter = express.Router();
  
  chatRouter.post("/send", sendMessage);
  chatRouter.delete("/delete", deleteMessagesByRoomId);
  chatRouter.post("/get-room", getChat);
  
  export default chatRouter;
  
  
  