import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
  addActivity,
  deleteActivity,
  deleteAllActivities,
} from "../Controllers/Activity.Controller.js";

  
  const activityRouter = express.Router();
  
  activityRouter.post("/add", addActivity);
  activityRouter.delete("/delete", deleteActivity);
  activityRouter.delete("/delete-all", deleteAllActivities); 
  
  export default activityRouter;
  
  
  