import bcrypt from "bcrypt";
import fs from 'fs';
import slugify from "slugify";
import mongoose from "mongoose";
import { generateToken } from "../utils/Jwt.js";
import { isAlphaOnly } from "../Utils/isAlphaOnly.js";
import { isProfanity } from "../Utils/ProfanityCheck/profanityCheck.js";
import User from "../Models/UserModel/User.Model.js";
import Post from "../Models/PostModel/Post.Model.js";
import Activity from "../Models/ActivityModel/Activity.Model.js";
import Notification from "../Models/NotificationModel/Notification.Model.js";
import Transaction from "../Models/TransactionModel/Transaction.Model.js";
import Comment from "../Models/CommentModel/Comment.Model.js";
import { getUserComments } from "../Utils/getUserComments.js";
import recursiveDelete from "../Utils/recursiveDelete.js";

export const signIn = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res.status(400).json({ error: "Error(101) All fields are required." });
      }
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: "Error(102) Invalid credentials." });
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ message: "Error(103) Invalid credentials." });
      }
  
      const token = generateToken(user);
  
      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        })
        .status(200)
        .json({ message: "Login successful" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error(104) Internal Server Error" });
    }
};
  
  export const signUp = async (req, res) => {
    const { firstName, lastName, email, dateOfBirth, gender, password } = req.body;
  
    try {
      if (!firstName 
        || !lastName 
        || !email
        || !dateOfBirth
        || !gender
        || !password
        ) {
        return res.status(400).json({ error: "Error(105) All fields are required." });
      }
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ error: "Error(106) Account with this email already exists." });
      }

      if(!isAlphaOnly(firstName) || !isAlphaOnly(lastName)){
        return res.status(400).json({ error: "Error(107) Names can only contain letters [A-Z, a-z]." });
      } 

      const fullName = [firstName, lastName].join(" ");

      const profanityFlag = await isProfanity(fullName.trim().split(/\s+/));

      if(profanityFlag){
        return res.status(400).json({ error: "Error(108) Profanity is not allowed." });
      }

      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const randomNumber = Math.floor(Math.random() * 90000) + 10000;
      const slugString = [fullName, randomNumber].join(' ');
      const userSlug = slugify(slugString, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
      })
  
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        dateOfBirth,
        gender,
        password: hashedPassword,
        role: "user",
        tokenAmount: 0,
        isVerified: false,
        isActivated: false,
        community: [],
        profilePic: null,
        slug: userSlug,
        userMap: null,
        posts: [],
        likedPosts: [],
      });
  
      if (!newUser) {
        return res.status(400).json({ error: "Error(109) Error creating user. Check database." });
      }
  
      const token = generateToken(newUser);

      return res.cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json(newUser);
    } catch (error) {
      return res.status(500).json({ err: "Error(110) Internal Server Error", msg: error });
    }
  };
  
  export const signOut = async (req, res) => {
    try {
      res.clearCookie("access_token");
      return res.status(200).json({ message: "Logout successful." });
    } catch (err) {
      res.status(500).json({ error: "Error(111) Internal Server Error" });
    }
  };


  export const addLike = async (req, res) =>{
    const {postId, userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
        return res.status(400).json({ error: "Error(112) invalid user or post id inputs"});
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if(!user || !post){
        return res.status(404).json({ error: "Error(113) User or post not found"});
    }
  
    try {
        const hashtagArray = post.hashtags;
  
        if(hashtagArray){
            for(let i=0; i < hashtagArray.length; i++){
                if(!user.userMap.has(hashtagArray[i])){
                    user.userMap.set(hashtagArray[i], 3);
                } else {
                    user.userMap.set(hashtagArray[i], user.userMap.get(hashtagArray[i]) + 3);
                }
            }
        }
  
        user.likedPosts = user.likedPosts.push(postId);
        await user.save();

        return res.status(200).json({ message: "Like added successfully." });

    } catch (err){
        return res.status(400).json({ error: "Error(114) Invalid updating user map."});
    }
  }


  export const addComment = async (req, res) =>{
    const {postId, userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
        return res.status(400).json({ error: "Error(115) invalid user or post id inputs"});
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if(!user || !post){
        return res.status(404).json({ error: "Error(116) User or post not found"});
    }
  
    try {
        const hashtagArray = post.hashtags;
  
        if(hashtagArray){
            for(let i=0; i < hashtagArray.length; i++){
                if(!user.userMap.has(hashtagArray[i])){
                    user.userMap.set(hashtagArray[i], 1);
                } else {
                    user.userMap.set(hashtagArray[i], user.userMap.get(hashtagArray[i]) + 1);
                }
            }
        }
  
        await user.save();
  
        return res.status(200).json({ message: "Comment added successfully." });
    
    } catch (err){
        return res.status(400).json({ error: "Error(117) Invalid updating user map."});
    }
  }
  
export const addShare = async (req, res) =>{
  const {postId, userId} = req.body;
  
  if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
      return res.status(400).json({ error: "Error(118) invalid user or post id inputs"});
  }
  
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  
  if(!user || !post){
      return res.status(404).json({ error: "Error(119) User or post not found"});
  }
  
  try {
    const hashtagArray = post.hashtags;
  
    if(hashtagArray){
      for(let i=0; i < hashtagArray.length; i++){
          if(!user.userMap.has(hashtagArray[i])){
              user.userMap.set(hashtagArray[i], 5);
          } else {
              user.userMap.set(hashtagArray[i], user.userMap.get(hashtagArray[i]) + 5);
          }
      }
    }
  
        await user.save();

        return res.status(200).json({ message: "Share added successfully." });
  
  } catch (err){
      return res.status(400).json({ error: "Error(120) Invalid updating user map."});
  }
}

export const activateAccount = async (req, res) =>{
  const {userId} = req.body;
  
  if(!mongoose.isValidObjectId(userId)){
      return res.status(400).json({ error: "Error(121) Invalid user id input."});
  }
  
  const user = await User.findById(userId);
  
  try{
      if(user.isActivated === false){
          user.isActivated = true;
          await user.save();
          return res.status(200).json({ message: "Account activated successfully." });
      } else {
          return res.status(400).json({ error: "Error(122) Account is already activated." });
      }
  } catch (err) {
      return res.status(500).json({ error: "Error(123) Internal server error."});
  }
}

export const verifyAccount = async (req, res) =>{
  const {userId} = req.body;
  
  if(!mongoose.isValidObjectId(userId)){
      return res.status(400).json({ error: "Error(124) Invalid user id input."});
  }
  
  const user = await User.findById(userId);
  
  try{
      if(user.isVerified === false){
          user.isVerified = true;
          await user.save();
          return res.status(200).json({ message: "Account verified successfully." });
      } else {
          return res.status(400).json({ error: "Error(125) Account is already verified." });
      }
  } catch (err) {
      return res.status(500).json({ error: "Error(126) Internal server error."});
  }
}

export const addFriend = async (req,res)=>{
  const {userId, friendId} = req.body;
  
  if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)){
      return res.status(400).json({ error: "Error(127) Invalid user or friend id input."});
  }
  
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);
  
  if(!user || !friend){
    return res.status(404).json({ error: "Error(128) User or friend not found."});
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let roomId = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomId += characters[randomIndex];
  }

  const userObject = {
    friendId: friendId,
    roomId: roomId,
  }

  const friendObject = {
    friendId: userId,
    roomId: roomId,
  }
  
 try{
    if(!user.community.includes(friendId) && !friend.community.includes(userId)){
        user.community.push(userObject);
        friend.community.push(friendObject);
        await user.save();
        await friend.save();
        return res.status(200).json({ message: "Friend added successfully." });
    } else {
        return res.status(400).json({ error: "Error(129) User and friend are already friends." });
    }
  } catch (err) {
      return res.status(500).json({ error: "Error(130) Internal server error."});
  }
}

export const updateUser = async (req, res) => {
  const { userId } = req.body;
  
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(131) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(132) User not found." });
  }
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const userUpdatedAt = user.updatedAt;
  
  if (userUpdatedAt > oneWeekAgo) {
    return res.status(400).json({ error: "Error(133) User info cannot be updated within a week." });
  }

  if(req.body.firstName){
    if(!isAlphaOnly(req.body.firstName)){
        return res.status(400).json({ error: "Error(134) Names can only contain letters [A-Z, a-z]." });
    }

    const profanityFlag = await isProfanity(firstName.trim().split(/\s+/));

    if(profanityFlag){
      return res.status(400).json({ error: "Error(135) Profanity is not allowed." });
    }
  }

  if(req.body.lastName){
    if(!isAlphaOnly(req.body.lastName)){
      return res.status(400).json({ error: "Error(136) Names can only contain letters [A-Z, a-z]." });
    }

    const profanityFlag = await isProfanity(lastName.trim().split(/\s+/));

    if(profanityFlag){
      return res.status(400).json({ error: "Error(137) Profanity is not allowed." });
    }
  }

  let newSlug = user.slug;

  if(req.body.firstName || req.body.lastName){
    const firstName = req.body.firstName || user.firstName;
    const lastName = req.body.lastName || user.lastName;
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const slugString = [firstName, lastName, randomNumber].join(' ');//fix
    newSlug = slugify(slugString, {
      replacement: '-',  // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: true,      // convert to lower case, defaults to `false`
      trim: true         // trim leading and trailing replacement chars, defaults to `true`
    })
  }
  
  try {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.password = req.body.password || user.password;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;
    user.slug = newSlug;
    await user.save();

    return res.status(200).json({ message: "User info updated successfully." });

  } catch (err) {
    return res.status(500).json({ error: "Error(138) Internal server error." });
  }
};

export const removeFriend = async (req, res) => {
  const { userId, friendId } = req.body;
  
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)) {
    return res.status(400).json({ error: "Error(139) Invalid user or friend id input." });
  }
  
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);
  
  if (!user || !friend) {
    return res.status(404).json({ error: "Error(140) User or friend not found." });
  }
  
  try {
    if (user.community.some((object) => object.friendId === friendId) 
    && friend.community.some((object) => object.friendId === userId)
  ) {
      user.community = user.community.filter((object) => object.friendId !== friendId);
      friend.community = friend.community.filter((object) => object.friendId !== userId);
      await user.save();
      await friend.save();
      return res.status(200).json({ message: "Friend removed successfully." });
    } else {
      return res.status(400).json({ error: "Error(141) User and friend are not currently friends." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error(142) Internal server error." });
  }
};

export const changeProfilePicture = async (req, res) => {
  const { userId } = req.body;
  const newProfilePic = req.file.path;
  
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(143) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    fs.unlinkSync(newProfilePic, (err) => {
       if (err) {
        return res.status(500).json({ error: "Error(144) Error removing new picture." });
      }
    });
    return res.status(404).json({ error: "Error(145) User not found." });
  }
  
  try {
    user.profilePic = newProfilePic;
    await user.save();

    return res.status(200).json({ message: "Profile picture updated successfully." });

  } catch (err) {
    fs.unlinkSync(newProfilePic, (err) => {
       if (err) {
        return res.status(500).json({ error: "Error(146) Error removing new picture." });
      }
    });

    return res.status(500).json({ error: "Error(147) Internal server error." });
  }
};

export const addTokens = async (req, res) =>{
  const {userId, amount} = req.body;
   
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(148) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(149) User not found." });
  }

  if(!amount || Number(amount) > 99 || Number(amount) <= 0){
    return res.status(404).json({ error: "Error(150) Invalid amount." });
  }

  try{
    let total = user.tokenAmount;
    total += amount;
    user.tokenAmount = token;
    await user.save();

    return res.status(200).json({ message: "Tokens added successfully." });

  } catch (err) {
    return res.status(500).json({ error: "Error(151) Internal server error." });
  }
}

export const createActivationCode = async (req, res) => {
  const { userId } = req.body;
  
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(152) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(153) User not found." });
  }
  
  const currentTime = new Date();
  const minuteAgo = new Date(currentTime.getTime() - 60 * 1000);
  
  if (user.activationCode && user.activationCodeCreatedAt >= minuteAgo) {
    return res.status(400).json({ error: "Error(154) Activation code was created within the last minute." });
  }
  
  try {
    let result = "";
  
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    const charactersLength = characters.length;
  
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    user.activationCode = result;
    user.activationCodeCreatedAt = currentTime;
    await user.save();

    return res.status(200).json({ message: "Activation code created successfully." });

  } catch (err) {
    return res.status(500).json({ error: "Error(155) Internal server error." });
  }
};

export const removeVerification = async (req, res) =>{
  const { userId } = req.body;
  
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(156) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(157) User not found." });
  }

  try{
    if(user.isVerified){
      user.isVerified = false;
      await user.save();
    }
      return res.status(200).json({ message: "Verification removed successfully."});
  } catch (err) {
    return res.status(500).json({ error: "Error(158) Internal server error." });
  }
}

export const removeProfilePicture = async (req,res) =>{
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(159) Invalid user id input." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(160) User not found." });
  }

  try {
    if(user.profilePic){
      user.profilePic = null;
      await user.save();
    }

    return res.status(200).json({ message: "Profile picture removed successfully."});

  } catch (err) {
    return res.status(500).json({ error: "Error(161) Internal server error." });
  }
}

export const deleteUserPost = async (req,res) =>{
  const { userId, postId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Error(162) Invalid user or post id." });
  }
  
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(163) User not found." });
  }
  if (!post) {
    return res.status(404).json({ error: "Error(164) Post not found." });
  }

  try {

    if(user.posts.includes(postId)){
      user.posts = user.posts.filter((id) => id !== postId);
      await user.save();
    }

    return res.status(200).json({ message: "Post removed successfully."});

  } catch (err) {
    return res.status(500).json({ error: "Error(165) Internal server error." });
  }
}

export const deleteUser = async (req,res) =>{
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(166) Invalid user id." });
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Error(167) User not found." });
  }

  try{
    await User.findByIdAndDelete(userId);
    await Activity.deleteMany({userId});
    await Notification.deleteMany({userId});
    await Transaction.deleteMany({userId});
    await Post.deleteMany({userId});

    const commentArray = getUserComments(userId);

    await Comment.deleteMany({userId});

    if(commentArray.length > 0){
      for(let i=0; i< commentArray.length; i++){
        recursiveDelete(commentArray[i]);
      }
    }

    return res.status(200).json({ message: "User deleted successfully."});
  
  } catch (err) {
    return res.status(500).json({ error: "Error(168) Internal server error." });
  }

}