import User from "../Models/UserModel/User.Model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/Jwt.js";
import slugify from "slugify";
import { isAlphaOnly } from "../Utils/isAlphaOnly.js";
import Post from "../Models/PostModel/Post.Model.js";
import fs from 'fs';

export const signIn = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res.status(400).json({ error: "Error(1) All fields are required." });
      }
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: "Error(2) Invalid credentials." });
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ message: "Error(3) Invalid credentials." });
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
        return res.status(500).json({ error: "Error(4) Internal Server Error" });
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
        return res.status(400).json({ error: "Error(5) All fields are required." });
      }
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ error: "Error(6) Account with this email already exists." });
      }

      if(!isAlphaOnly(firstName) || !isAlphaOnly(lastName)){
        return res.status(400).json({ error: "Error(7) Names can only contain letters [A-Z, a-z]." });
      }

      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const randomNumber = Math.floor(Math.random() * 90000) + 10000;
      const slugString = [firstName, lastName, randomNumber].join(' ');
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
      });
  
      if (!newUser) {
        return res.status(400).json({ error: "Error(8) Error creating user. Check database." });
      }
  
      const token = generateToken(newUser);

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
  
      res.status(200).json(newUser);
    } catch (error) {
      return res.status(500).json({ err: "Error(9) Internal Server Error", msg: error });
    }
  };
  
  export const signOut = async (req, res) => {
    try {
      res.clearCookie("access_token");
      return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      res.status(500).json({ error: "Error(10) Internal Server Error" });
    }
  };


  export const addLike = async (req, res) =>{
    const {postId, userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
        return res.status(400).json({ error: "Error(11) invalid user or post id inputs"});
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if(!user || !post){
        return res.status(404).json({ error: "Error(12) User or post not found"});
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
  
        await user.save();
  
    } catch (err){
        return res.status(400).json({ error: "Error(13) Invalid updating user map."});
    }
  }


  export const addComment = async (req, res) =>{
    const {postId, userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
        return res.status(400).json({ error: "Error(14) invalid user or post id inputs"});
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if(!user || !post){
        return res.status(404).json({ error: "Error(15) User or post not found"});
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
  
    } catch (err){
        return res.status(400).json({ error: "Error(16) Invalid updating user map."});
    }
  }
  
  export const addShare = async (req, res) =>{
    const {postId, userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)){
        return res.status(400).json({ error: "Error(17) invalid user or post id inputs"});
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if(!user || !post){
        return res.status(404).json({ error: "Error(18) User or post not found"});
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
  
    } catch (err){
        return res.status(400).json({ error: "Error(19) Invalid updating user map."});
    }
  }

  export const activateAccount = async (req, res) =>{
    const {userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({ error: "Error(20) Invalid user id input."});
    }
  
    const user = await User.findById(userId);
  
    try{
        if(user.isActivated === false){
            user.isActivated = true;
            await user.save();
            return res.status(200).json({ message: "Account activated successfully." });
        } else {
            return res.status(400).json({ error: "Error(21) Account is already activated." });
        }
    } catch (err) {
        return res.status(500).json({ error: "Error(22) Internal server error."});
    }
  }

  export const verifyAccount = async (req, res) =>{
    const {userId} = req.body;
  
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({ error: "Error(23) Invalid user id input."});
    }
  
    const user = await User.findById(userId);
  
    try{
        if(user.isVerified === false){
            user.isVerified = true;
            await user.save();
            return res.status(200).json({ message: "Account activated successfully." });
        } else {
            return res.status(400).json({ error: "Error(24) Account is already activated." });
        }
    } catch (err) {
        return res.status(500).json({ error: "Error(25) Internal server error."});
    }
  }

  export const addFriend = async (req,res)=>{
    const {userId, friendId} = req.body;
  
    if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)){
        return res.status(400).json({ error: "Error(26) Invalid user or friend id input."});
    }
  
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
  
    if(!user || !friend){
        return res.status(404).json({ error: "Error(27) User or friend not found"});
    }
  
    try{
        if(!user.community.includes(friendId) && !friend.community.includes(userId)){
            user.community.push(friendId);
            friend.community.push(userId);
            await user.save();
            await friend.save();
            return res.status(200).json({ message: "Friend added successfully." });
        } else {
            return res.status(400).json({ error: "Error(28) User and friend are already friends." });
        }
    } catch (err) {
        return res.status(500).json({ error: "Error(29) Internal server error."});
    }
  }

  export const updateUser = async (req, res) => {
    const { userId } = req.body;
  
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Error(30) Invalid user id input." });
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ error: "Error(31) User not found." });
    }
  
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const userUpdatedAt = user.updatedAt;
  
    if (userUpdatedAt > oneWeekAgo) {
      return res.status(400).json({ error: "Error(32) User info cannot be updated within a week." });
    }

    if(req.body.firstName){
        if(!isAlphaOnly(req.body.firstName)){
            return res.status(400).json({ error: "Error(33) Names can only contain letters [A-Z, a-z]." });
          }
    }

    if(req.body.lastName){
        if(!isAlphaOnly(req.body.lastName)){
            return res.status(400).json({ error: "Error(34) Names can only contain letters [A-Z, a-z]." });
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
      return res.status(500).json({ error: "Error(35) Internal server error." });
    }
  };


  export const removeFriend = async (req, res) => {
    const { userId, friendId } = req.body;
  
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)) {
      return res.status(400).json({ error: "Error(36) Invalid user or friend id input." });
    }
  
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
  
    if (!user || !friend) {
      return res.status(404).json({ error: "Error(37) User or friend not found." });
    }
  
    try {
      if (user.community.includes(friendId) && friend.community.includes(userId)) {
        user.community = user.community.filter((id) => id !== friendId);
        friend.community = friend.community.filter((id) => id !== userId);
        await user.save();
        await friend.save();
        return res.status(200).json({ message: "Friend removed successfully." });
      } else {
        return res.status(400).json({ error: "Error(38) User and friend are not currently friends." });
      }
    } catch (err) {
      return res.status(500).json({ error: "Error(39) Internal server error." });
    }
  };

  export const changeProfilePicture = async (req, res) => {
    const { userId } = req.body;
    const newProfilePic = req.file.path;
  
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Error(40) Invalid user id input." });
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      fs.unlinkSync(newProfilePic, (err) => {
        if (err && err.code === 'ENOENT') {
          // File does not exist, so no error
        } else if (err) {
          return res.status(500).json({ error: "Error(41) Error removing new picture." });
        }
      });
      return res.status(404).json({ error: "Error(42) User not found." });
    }
  
    if (user.profilePic) {
      fs.access(user.profilePic, fs.constants.F_OK, (err) => {
        if (err && err.code === 'ENOENT') {
          // File does not exist, so no error
        } else if (err) {
          return res.status(500).json({ error: "Error(43) Error removing old picture." });
        } else {
          fs.unlinkSync(user.profilePic, (err) => {
            if (err) {
              return res.status(500).json({ error: "Error(44) Error removing old picture." });
            }
          });
        }
      });
    }
  
    try {
      user.profilePic = newProfilePic;
      await user.save();
      return res.status(200).json({ message: "Profile Picture updated successfully." });
    } catch (err) {
      fs.unlinkSync(newProfilePic, (err) => {
        if (err && err.code === 'ENOENT') {
          // File does not exist, so no error
        } else if (err) {
          return res.status(500).json({ error: "Error(45) Error removing new picture." });
        }
      });
      return res.status(500).json({ error: "Error(46) Internal server error." });
    }
  };


  //remove like
  //remove share
  //remove comment
  //deactivate
  //remove verification
//   In the signIn function, you are checking if the user exists and if the password is valid before generating a token and logging in the user. However, you are not checking if the user's account is activated or verified before logging in the user. This can lead to security vulnerabilities.
//The code is using mongoose.isValidObjectId to validate ObjectIds. However, this function is not available by default in Mongoose and should be imported from the Mongoose library. You should import mongoose.isValidObjectId from the Mongoose library and use it to validate ObjectIds.
