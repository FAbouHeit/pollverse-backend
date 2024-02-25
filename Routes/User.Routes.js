import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import upload from "../Utils/Multer.js";

import {
  signIn,
  signUp,
  signOut,
  addLike,
  addComment,
  addShare,
  activateAccount,
  verifyAccount,
  addFriend,
  updateUser,
  removeFriend, //fix
  changeProfilePicture,
  addTokens,
  createActivationCode,
  removeVerification,
  removeProfilePicture,
  deleteUserPost,
  deleteUser,
} from "../Controllers/User.Controller.js";
  
  const userRouter = express.Router();
  
  userRouter.post("/sign-in", signIn);
  userRouter.post("/sign-up", signUp);
  userRouter.get("/sign-out", signOut);

  userRouter.post("/add/like", addLike);
  userRouter.post("/add/comment", addComment);
  userRouter.post("/add/share", addShare);

  userRouter.post("/account/activate", activateAccount);
  userRouter.post("/account/verify", verifyAccount);
  userRouter.post("/account/remove-verification", removeVerification);
  userRouter.post("/account/create-verification-code", createActivationCode);

  userRouter.post("/friend/add", addFriend);
  userRouter.post("/friend/remove", removeFriend);
  
  userRouter.patch("/update", updateUser);
  userRouter.patch("/change-profile-picture", upload.single("image"), changeProfilePicture);
  userRouter.patch("/remove-profile-picture", removeProfilePicture);
  userRouter.delete("/delete-post", deleteUserPost);

  userRouter.post("/add-tokens", addTokens);

  userRouter.delete("/delete-user", deleteUser);
  
  export default userRouter;
  
  
  