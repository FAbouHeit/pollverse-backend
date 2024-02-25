import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
    createComment,
    editComment,
    deleteComment,
    getAllComments,
} from "../Controllers/Comment.Controller.js";

  
  const commentRouter = express.Router();
  
  commentRouter.post("/create", createComment);
  commentRouter.patch("/edit", editComment);
  commentRouter.delete("/delete", deleteComment); 
  commentRouter.get("/get-all", getAllComments); 
  
  export default commentRouter;
  
  
  