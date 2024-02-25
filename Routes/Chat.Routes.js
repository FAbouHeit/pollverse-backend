import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
    sendMessage,
    deleteMessagesByRoomId,
} from "../Controllers/Chat.Controller.js";

  
  const chatRouter = express.Router();
  
  chatRouter.post("/send", sendMessage);
  chatRouter.delete("/delete", deleteMessagesByRoomId);
  
  export default chatRouter;
  
  
  