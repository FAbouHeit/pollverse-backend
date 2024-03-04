import express from "express";
import { authenticate } from "../Middleware/Auth.js";
import upload from "../Utils/Multer.js";

import {
  signIn,
  signUp,
  signOut,
  addLike,
  removeLike,
  addComment,
  addShare,
  activateAccount,
  verifyAccount,
  getFriends,
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
  sendFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  signedInUser,
  addUserResponse,
  emptyResponseArray,
  getRoomId,
} from "../Controllers/User.Controller.js";
  
  const userRouter = express.Router();
  
  userRouter.post("/sign-in", signIn);
  userRouter.post("/sign-up", signUp);
  userRouter.get("/sign-out", signOut);
  userRouter.get("/signed-in-user", authenticate, signedInUser);

  userRouter.post("/add/like",authenticate ,addLike);
  userRouter.post("/remove/like", authenticate,removeLike);
  userRouter.post("/add/comment", addComment);
  userRouter.post("/add/share", addShare);
  userRouter.post("/add/response", addUserResponse);
  userRouter.post("/remove/responses", emptyResponseArray);


  userRouter.patch("/account/activate/:code", activateAccount);
  userRouter.patch("/account/verify", verifyAccount);
  userRouter.patch("/account/remove-verification", removeVerification);
  userRouter.post("/account/create-activation-code", createActivationCode);

  userRouter.post("/friend/", getFriends);
  userRouter.post("/friend/add", addFriend);
  userRouter.post("/friend/remove", removeFriend);
  userRouter.post("/friend/request", sendFriendRequest);
  userRouter.post("/friend/decline", declineFriendRequest);
  userRouter.post("/friend/cancel-request", cancelFriendRequest); 
  
  userRouter.patch("/update", updateUser);
  userRouter.patch("/change-profile-picture", upload.single("image"), changeProfilePicture);
  userRouter.patch("/remove-profile-picture", removeProfilePicture);
  userRouter.delete("/delete-post", deleteUserPost);

  userRouter.post("/add-tokens", addTokens);
  userRouter.post("/get-room", getRoomId);

  userRouter.delete("/delete-user", deleteUser);

  userRouter.get("/", getAllUsers);
  userRouter.get("/byId", getOneUser);
  
  export default userRouter;
  
  
  