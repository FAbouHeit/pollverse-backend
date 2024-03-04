import bcrypt from "bcrypt";
import fs from "fs";
import slugify from "slugify";
import mongoose from "mongoose";
import { generateToken } from "../Utils/Jwt.js";
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
import { error } from "console";

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Error(101) All fields are required.", errCode: 101 });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Error(102) Invalid credentials.", errCode: 102 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Error(103) Invalid credentials.", errCode: 103 });
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

export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, dateOfBirth, gender, password } =
    req.body;

  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !gender ||
      !password
    ) {
      return res
        .status(400)
        .json({ error: "Error(105) All fields are required." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Error(106) Account with this email already exists." });
    }

    if (!isAlphaOnly(firstName) || !isAlphaOnly(lastName)) {
      return res.status(400).json({
        error: "Error(107) Names can only contain letters [A-Z, a-z].",
      });
    }

    const genders = ["male", "female", "unspecified"];

    if (!genders.includes(gender)) {
      return res
        .status(400)
        .json({ error: "Error(107.1) Invalid gender input." });
    }

    const date = new Date(dateOfBirth);
    const currentDate = new Date();
    const thirteenYearsAgo = new Date(currentDate);
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
    if (date > thirteenYearsAgo) {
      return res
        .status(400)
        .json({ error: "Error(107.2) User must be over 13 years of age." });
    }

    const hasNumber = /\d/.test(password);
    const hasCapitalLetter = /[A-Z]/.test(password);
    const hasCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const isLongEnough = password.length;
    if (!hasNumber || !hasCapitalLetter || !hasCharacter || isLongEnough < 6) {
      return res
        .status(400)
        .json({ error: "Error(107.3) Invalid password input." });
    }

    const fullName = [firstName, lastName].join(" ");

    const profanityFlag = await isProfanity(fullName.trim().split(/\s+/));

    if (profanityFlag) {
      return res
        .status(400)
        .json({ error: "Error(108) Profanity is not allowed." });
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const slugString = [fullName, randomNumber].join(" ");
    const userSlug = slugify(slugString, {
      replacement: "-", // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: true, // convert to lower case, defaults to `false`
      trim: true, // trim leading and trailing replacement chars, defaults to `true`
    });


    const map = new Map;

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
      profilePic: null,
      slug: userSlug,
      userMap: map,
      community: [],
      posts: [],
      likedPosts: [],
      respondedPosts: [],
      friendReqSent: [],
      friendReqReceived: [],
    });

    if (!newUser) {
      return res
        .status(400)
        .json({ error: "Error(109) Error creating user. Check database." });
    }


    const token = generateToken(newUser);

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json(newUser);
  } catch (error) {
    console.log("error: ", error)
    return res.status(500).json({ err: "Error(110) Internal Server Error", error });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "SignOut successful." });
  } catch (err) {
    res.status(500).json({ error: "Error(111) Internal Server Error" });
  }
};

export const addLike = async (req, res) => {
  const { postId, userId } = req.body;
  console.log("UserLIke", req.body)
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res
      .status(400)
      .json({ error: "Error(112) invalid user or post id inputs" });
  }

  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "Error(113) User or post not found" });
  }

  try {
    const hashtagArray = post.hashtags;

    if (hashtagArray.length > 0) {
      const updatedMap = user.userMap;
    
      for (let i = 0; i < hashtagArray.length; i++) {
        if (!updatedMap.has(hashtagArray[i])) {
          // update[`userMap.${hashtagArray[i]}`] = 3;
          updatedMap.set(hashtagArray[i] ,3);
        } else {
          // update[`userMap.${hashtagArray[i]}`] = user.userMap.get(hashtagArray[i]) + 3;
          const newValue = updatedMap.get(hashtagArray[i]) + 3;
          updatedMap.set(hashtagArray[i],  newValue);
        }
      }
    
      user.userMap = updatedMap;
      await user.save();
      // await User.updateOne({ _id: user._id }, { $set: update });
    }

    if(!user.likedPosts.includes(postId)){
      const newLikedPostsArray = [...user.likedPosts, postId]; 
      user.likedPosts = newLikedPostsArray;
      await user.save();
    }

    return res.status(200).json({ message: "Like added successfully." });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Error(114) Invalid updating user map.", error: err });
  }
};


export const removeLike = async (req, res) => {
  const { postId, userId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res
      .status(400)
      .json({ error: "Error(114.1) invalid user or post id inputs" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { likedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Error(114.2) User not found" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Error(114.3) Post not found" });
    }

    return res.status(200).json({ message: "Like removed successfully." });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Error(114.4) Internal server error." });
  }
};
export const addComment = async (req, res) => {
  const { postId, userId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res
      .status(400)
      .json({ error: "Error(115) invalid user or post id inputs" });
  }

  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "Error(116) User or post not found" });
  }

  try {
    const hashtagArray = post.hashtags;

    if (hashtagArray) {
      for (let i = 0; i < hashtagArray.length; i++) {
        if (!user.userMap.has(hashtagArray[i])) {
          user.userMap.set(hashtagArray[i], 1);
        } else {
          user.userMap.set(
            hashtagArray[i],
            user.userMap.get(hashtagArray[i]) + 1
          );
        }
      }
    }

    await user.save();

    return res.status(200).json({ message: "Comment added successfully." });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Error(117) Invalid updating user map." });
  }
};

export const addShare = async (req, res) => {
  const { postId, userId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res
      .status(400)
      .json({ error: "Error(118) invalid user or post id inputs" });
  }

  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "Error(119) User or post not found" });
  }

  try {
    const hashtagArray = post.hashtags;

    if (hashtagArray) {
      for (let i = 0; i < hashtagArray.length; i++) {
        if (!user.userMap.has(hashtagArray[i])) {
          user.userMap.set(hashtagArray[i], 5);
        } else {
          user.userMap.set(
            hashtagArray[i],
            user.userMap.get(hashtagArray[i]) + 5
          );
        }
      }
    }

    await user.save();

    return res.status(200).json({ message: "Share added successfully." });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Error(120) Invalid updating user map." });
  }
};

export const activateAccount = async (req, res) => {
  const activationCode = req.params.code;

  if (!activationCode) {
    return res
      .status(400)
      .json({ error: "Error(121) Invalid activation code." });
  }

  const user = await User.findOne({ activationCode });

  if (!user) {
    return res
      .status(400)
      .json({ error: "Error(121.1) Invalid activation code." });
  }

  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

  const activationCodeDate = new Date(user.activationCodeCreatedAt);
  if (activationCodeDate < fifteenMinutesAgo) {
    return res
      .status(400)
      .json({ error: "Error(121.2) Expired activation code." });
  }

  try {
    if (!user.isActivated) {
      await User.findByIdAndUpdate(
        user._id,
        { isActivated: true },
        { new: true }
      );
      // user.isActivated = true;
      // await user.save();
      return res
        .status(200)
        .json({ message: "Account activated successfully." });
    } else {
      return res
        .status(400)
        .json({ error: "Error(122) Account is already activated." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error(123) Internal server error." });
  }
};

export const verifyAccount = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(124) Invalid user id input." });
  }

  const user = await User.findById(userId);

  try {
    if (!user.isVerified) {
      // user.isVerified = true;
      // await user.save();
      await User.findByIdAndUpdate(
        user._id,
        { isVerified: true },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Account verified successfully." });
    } else {
      return res
        .status(400)
        .json({ error: "Error(125) Account is already verified." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error(126) Internal server error." });
  }
};

export const getFriends = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by ID and populate the 'community' field
    const user = await User.findById(userId).populate({
      path: 'community.friendId',
      model: 'User'
    });

    // Extract the populated community friends
    const communityFriends = user.community.map(item => item.friendId);

    // Send the communityFriends array as a response
    res.status(200).json({ communityFriends });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addFriend = async (req, res) => {
  const { userId, friendId } = req.body;

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return res
      .status(400)
      .json({ error: "Error(127) Invalid user or friend id input." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res
      .status(404)
      .json({ error: "Error(128) User or friend not found." });
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomId += characters[randomIndex];
  }

  const userObject = {
    friendId: friendId,
    roomId: roomId,
  };

  const friendObject = {
    friendId: userId,
    roomId: roomId,
  };

  try {
    if (
      !user.community.some((obj) => obj.friendId === friendId) &&
      !friend.community.some((obj) => obj.friendId === userId)
    ) {
      user.community.push(userObject);
      friend.community.push(friendObject);

      console.log("before: ", user.friendReqReceived)
      user.friendReqReceived = user.friendReqReceived.filter((id) => id !== friendId);
      friend.friendReqSent = user.friendReqSent.filter((id) => id !== userId);
      console.log("after: ", user.friendReqReceived)


      await user.save();
      await friend.save();
      return res.status(200).json({ message: "Friend added successfully." });
    } else {
      return res
        .status(400)
        .json({ error: "Error(129) User and friend are already friends." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error(130) Internal server error." });
  }
};

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
    return res
      .status(400)
      .json({ error: "Error(133) User info cannot be updated within a week." });
  }

  if (req.body.firstName) {
    if (!isAlphaOnly(req.body.firstName)) {
      return res.status(400).json({
        error: "Error(134) Names can only contain letters [A-Z, a-z].",
      });
    }

    const profanityFlag = await isProfanity(firstName.trim().split(/\s+/));

    if (profanityFlag) {
      return res
        .status(400)
        .json({ error: "Error(135) Profanity is not allowed." });
    }
  }

  if (req.body.lastName) {
    if (!isAlphaOnly(req.body.lastName)) {
      return res.status(400).json({
        error: "Error(136) Names can only contain letters [A-Z, a-z].",
      });
    }

    const profanityFlag = await isProfanity(lastName.trim().split(/\s+/));

    if (profanityFlag) {
      return res
        .status(400)
        .json({ error: "Error(137) Profanity is not allowed." });
    }
  }

  let newSlug = user.slug;

  if (req.body.firstName || req.body.lastName) {
    const firstName = req.body.firstName || user.firstName;
    const lastName = req.body.lastName || user.lastName;
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const slugString = [firstName, lastName, randomNumber].join(" "); //fix
    newSlug = slugify(slugString, {
      replacement: "-", // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: true, // convert to lower case, defaults to `false`
      trim: true, // trim leading and trailing replacement chars, defaults to `true`
    });
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

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return res
      .status(400)
      .json({ error: "Error(139) Invalid user or friend id input." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res
      .status(404)
      .json({ error: "Error(140) User or friend not found." });
  }

  try {
    if (
      user.community.some((object) => object.friendId === friendId) &&
      friend.community.some((object) => object.friendId === userId)
    ) {
      user.community = user.community.filter(
        (object) => object.friendId !== friendId
      );
      friend.community = friend.community.filter(
        (object) => object.friendId !== userId
      );
      await user.save();
      await friend.save();
      return res.status(200).json({ message: "Friend removed successfully." });
    } else {
      return res.status(400).json({
        error: "Error(141) User and friend are not currently friends.",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error(142) Internal server error." });
  }
};

export const changeProfilePicture = async (req, res) => {
  const { userId } = req.body;
  const newProfilePic = req.file.path;

  if (!mongoose.isValidObjectId(userId)) {
    fs.unlinkSync(newProfilePic, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error(143) Error removing new picture." });
      }
    });
    return res.status(400).json({ error: "Error(143.1) Invalid user id input." });
  }

  const user = await User.findById(userId);

  if (!user) {
    fs.unlinkSync(newProfilePic, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error(144) Error removing new picture." });
      }
    });
    return res.status(404).json({ error: "Error(144.1) User not found." });
  }

  // Check if the user already has a profile picture and delete it
  if (user.profilePic) {
    fs.unlinkSync(user.profilePic, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error(145) Error removing old picture." });
      }
    });
  }

  try {
    user.profilePic = newProfilePic;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile picture updated successfully." });
  } catch (err) {
    fs.unlinkSync(newProfilePic, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error(146) Error removing new picture." });
      }
    });

    return res.status(500).json({ error: "Error(147) Internal server error." });
  }
};

export const addTokens = async (req, res) => {
  const { userId, amount } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(148) Invalid user id input." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(149) User not found." });
  }

  if (!amount || Number(amount) > 99 || Number(amount) <= 0) {
    return res.status(404).json({ error: "Error(150) Invalid amount." });
  }

  try {
    let total = user.tokenAmount;
    total += amount;
    user.tokenAmount = total;
    await user.save();

    return res.status(200).json({ message: "Tokens added successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(151) Internal server error." });
  }
};

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
    return res.status(400).json({
      error: "Error(154) Activation code was created within the last minute.",
    });
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

    return res
      .status(200)
      .json({ message: "Activation code created successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(155) Internal server error." });
  }
};

export const removeVerification = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(156) Invalid user id input." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(157) User not found." });
  }

  try {
    if (user.isVerified) {
      // user.isVerified = false;
      // await user.save();
      await User.findByIdAndUpdate(
        user._id,
        { isVerified: false },
        { new: true }
      );
    }
    return res
      .status(200)
      .json({ message: "Verification removed successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(158) Internal server error." });
  }
};

export const removeProfilePicture = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(159) Invalid user id input." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(160) User not found." });
  }

  try {
    if (user.profilePic) {
      user.profilePic = null;
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "Profile picture removed successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(161) Internal server error." });
  }
};

export const deleteUserPost = async (req, res) => {
  const { userId, postId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res
      .status(400)
      .json({ error: "Error(162) Invalid user or post id." });
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
    if (user.posts.includes(postId)) {
      user.posts = user.posts.filter((id) => id !== postId);
      await user.save();
    }

    return res.status(200).json({ message: "Post removed successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(165) Internal server error." });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(166) Invalid user id." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(167) User not found." });
  }

  try {

    if (user.profilePic) {
      fs.unlinkSync(user.profilePic, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error(167.1) Error removing old picture." });
        }
      });
    }

    await User.findByIdAndDelete(userId);
    await Activity.deleteMany({ userId });
    await Notification.deleteMany({ userId });
    await Transaction.deleteMany({ userId });
    await Post.deleteMany({ userId });

    const commentArray = getUserComments(userId);

    await Comment.deleteMany({ userId });

    if (commentArray.length > 0) {
      for (let i = 0; i < commentArray.length; i++) {
        recursiveDelete(commentArray[i]);
      }
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Error(168) Internal server error." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: "Error(169) Internal server error." });
  }
};

export const getOneUser = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Error(170) Invalid user id." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(171) User not found." });
  }

  try {
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error(172) Internal server error." });
  }
};

export const sendFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  if (userId === friendId) {
    return res
      .status(400)
      .json({ error: "Error(173) Cannot add yourself as a friend." });
  }

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return res
      .status(400)
      .json({ error: "Error(174) Invalid user or friend id input." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res
      .status(404)
      .json({ error: "Error(175) User or friend not found." });
  }

  try {

    user.friendReqSent.push(friendId);
    friend.friendReqReceived.push(userId);

    await user.save();
    await friend.save();
    return res.status(200).json({ message: "Friend request sent successfully." });

  } catch (err) {
    return res.status(500).json({ error: "Error(177) Internal server error.", err });
  }
};



export const declineFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  if (userId === friendId) {
    return res
      .status(400)
      .json({ error: "Error(177.1) Cannot add yourself as a friend." });
  }

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return res
      .status(400)
      .json({ error: "Error(177.2) Invalid user or friend id input." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res
      .status(404)
      .json({ error: "Error(177.3) User or friend not found." });
  }

  try {
    let userFriendReqSent = user.friendReqSent.slice();
    let userFriendReqReceived = user.friendReqReceived.slice();
    let friendFriendReqSent = friend.friendReqSent.slice();
    let friendFriendReqReceived = friend.friendReqReceived.slice();

      userFriendReqSent= userFriendReqSent.filter((id)=> id !== friendId);
      userFriendReqReceived = userFriendReqReceived.filter((id)=> id !== friendId);

      friendFriendReqSent = friendFriendReqSent.filter((id)=> id !== userId);
      friendFriendReqReceived = friendFriendReqReceived.filter((id)=> id !== userId);

      user.friendReqSent = userFriendReqSent;
      user.friendReqReceived = userFriendReqReceived;

      friend.friendReqSent = friendFriendReqSent;
      friend.friendReqReceived = friendFriendReqReceived;

      await user.save();
      await friend.save();
      return res.status(200).json({ message: "Friend request deleted successfully." });
    
  } catch (err) {
    return res.status(500).json({ error: "Error(177.4) Internal server error.", errorr: err });
  }
};

export const cancelFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;
  if (userId === friendId) {
    return res
      .status(400)
      .json({ error: "Error(177.5) Cannot add yourself as a friend." });
  }

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return res
      .status(400)
      .json({ error: "Error(177.6) Invalid user or friend id input." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res
      .status(404)
      .json({ error: "Error(177.7) User or friend not found." });
  }

  try {
    if (user.friendReqSent.includes(friendId)) {
      user.friendReqSent = user.friendReqSent.filter((id) => id !== friendId);
    }

    if (friend.friendReqReceived.includes(userId)) {
      friend.friendReqReceived = friend.friendReqReceived.filter(
        (id) => id !== userId
      );
    }

    await friend.save();
    await user.save();

    return res.status(200).json({ message: "Cancelled request" });
  } catch (err) {
    return res.status(500).json({ error: "Error(177.8) Internal server error." });
  }
};


export const addUserResponse = async (req,res) =>{
  const {userId, postId, optionIndex} = req.body;

  if(optionIndex === undefined || optionIndex===null){
    return res.status(400).json({ error: "Error(177.1) Invalid option index." });
    
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Error(178) Invalid post or user id." });
  }

  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "Error(179) User or post not found." });
  }

  try{
    const responsedPostsArray = [...user.respondedPosts];
    const newResponse = {
      postId,
      optionIndex,
    }
    responsedPostsArray.push(newResponse);
    user.respondedPosts = responsedPostsArray;
    await user.save();
    return res.status(200).json({ message: "User response added successfully." });

  } catch (err){
    return res.status(500).json({ error: "Error(180) Internal server error." });
  }


}

export const emptyResponseArray = async (req, res) => {
  const { userId } = req.body;
  console.log("deleting responded posts")
  try {
    const user = await User.findById(userId);
    user.respondedPosts.splice(0, user.respondedPosts.length);
    await user.save();
    return res.status(200).json({ message: "User responses deleted successfully." });
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

export const signedInUser = async(req, res) => {
  const user = await User.findById(req.user.id );

  return res.json({ user: user}).status(200);
};


export const getRoomId = async (req,res) =>{
  const {userId, friendId} = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)) {
    return res.status(400).json({ error: "Error(181) Invalid post or user id." });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res.status(404).json({ error: "Error(182) User or friend not found." });
  }

  try{
    let friendship = user.community.find((obj)=> obj.friendId.toString() === friendId.toString());
    const roomId = friendship.roomId;

    return res.status(200).json({ roomId });

  } catch (err){
    return res.status(500).json({ error: "Error(183) Internal server error." });
  }


}