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
  getAllUsers,
  getOneUser,
} from "../Controllers/User.Controller.js";
  
  const userRouter = express.Router();
  
  userRouter.post("/sign-in", signIn);
  userRouter.post("/sign-up", signUp);
  userRouter.get("/sign-out", signOut);

  userRouter.post("/add/like", addLike);
  userRouter.post("/add/comment", addComment);
  userRouter.post("/add/share", addShare);

  userRouter.patch("/account/activate/:code", activateAccount);
  userRouter.patch("/account/verify", verifyAccount);
  userRouter.patch("/account/remove-verification", removeVerification);
  userRouter.post("/account/create-activation-code", createActivationCode);

  userRouter.post("/friend/add", addFriend);
  userRouter.post("/friend/remove", removeFriend);
  
  userRouter.patch("/update", updateUser);
  userRouter.patch("/change-profile-picture", upload.single("image"), changeProfilePicture);
  userRouter.patch("/remove-profile-picture", removeProfilePicture);
  userRouter.delete("/delete-post", deleteUserPost);

  userRouter.post("/add-tokens", addTokens);

  userRouter.delete("/delete-user", deleteUser);

  userRouter.get("/", getAllUsers);
  userRouter.get("/byId", getOneUser);
  
  export default userRouter;
  
  
  