import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
    addNotification,
    deleteNotification,
    deleteAllNotifications,
} from "../Controllers/Notification.Controller.js";

  
  const notificationRouter = express.Router();
  
  notificationRouter.post("/add", addNotification);
  notificationRouter.delete("/delete", deleteNotification);
  notificationRouter.delete("/delete-all", deleteAllNotifications); 
  
  export default notificationRouter;
  
  
  