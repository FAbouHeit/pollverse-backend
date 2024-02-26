import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
  createPost,
  addResponse,
  deletePost,
  editCaption,
  addLike,
  addShare,
  addComment,
  getPublicPosts,
  getFriendsPrivatePosts,
  getUserPosts,
} from "../Controllers/Post.Controller.js";

  
  const postRouter = express.Router();
  
  postRouter.post("/create", createPost);
  postRouter.post("/response", addResponse);
  postRouter.delete("/delete", deletePost);
  postRouter.patch("/edit", editCaption);

  postRouter.post("/like", addLike);
  postRouter.post("/share", addShare);
  postRouter.post("/comment", addComment); 

  postRouter.get("/", getPublicPosts);
  postRouter.get("/private", getFriendsPrivatePosts);
  postRouter.get("/user", getUserPosts);

  
  export default postRouter;
  
  
  