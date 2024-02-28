//get posts?
//sent a report (send post id)

import mongoose from "mongoose";
import Post from "../Models/PostModel/Post.Model.js";
import User from "../Models/UserModel/User.Model.js";
import { isProfanity } from "../Utils/ProfanityCheck/profanityCheck.js";
import slugify from "slugify";

export const createPost = async (req, res) => {
    const { userId, caption, type, options, visibility, isSponsored } = req.body;

    let postOptions = [];
  
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Error(201) Invalid user id input." });
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ error: "Error(202) User not found." });
    }

    if(!caption
      || !type
      || !options
      || !visibility
      || isSponsored === undefined
      ){
        // console.log(caption)
        // console.log(type)
        // console.log(options)
        // console.log(visibility)
        // console.log(isSponsored)
      return res.status(400).json({ error: "Error(203) Invalid post input." });
    }

    if(isSponsored === true && user.tokenAmount < 20){
      return res.status(400).json({ error: "Error(203.1) Insufficient user tokens." });
    }
    
    const profanityFlag = await isProfanity(caption.trim().split(/\s+/));

    if(profanityFlag){
      return res.status(400).json({ error: "Error(204) Profanity is not allowed." });
    }

    if(caption.length > 120){
      return res.status(400).json({ error: "Error(205) Invalid post length." });
    }

    const postVisibility = ["public", "private"];

    if(!postVisibility.includes(visibility)){
        return res.status(400).json({ error: "Error(206) Invalid post type." });
      }

    const postTypes = ["twoChoice", "multiChoice", "quiz", "slider"];

    if(!postTypes.includes(type)){
      return res.status(400).json({ error: "Error(207) Invalid post type." });
    }

    if(type === "twoChoice"){
        if(options.length !== 2){
            return res.status(400).json({ error: "Error(208) Invalid post options." });
        }

        for(let i=0; i < options.length; i++){
            if(typeof(options[i]) !== "string"){
                return res.status(400).json({ error: "Error(209) Invalid post options." });
            }
            postOptions.push({value: options[i], responses: 0});
        }
    }

    if(type === "multiChoice"){
        if(options.length < 3 || options.length > 10){
            return res.status(400).json({ error: "Error(210) Invalid post options." });
        }

        for(let i=0; i < options.length; i++){
            if(typeof(options[i]) != "string"){
                return res.status(400).json({ error: "Error(211) Invalid post options." });
            }
            postOptions.push({value: options[i], responses: 0});
        }
    }

    if(type === "quiz"){
        if(options.length !== 4){
            return res.status(400).json({ error: "Error(212) Invalid post options." });
        }

        let correctOptionDetected = false; 

        for(let i=0; i < options.length; i++){
            if(typeof(options[i].value) !== "boolean" || typeof(options[i].name) != "string"){
                return res.status(400).json({ error: "Error(213) Invalid post options." });
            }
            if(options[i].value === true){
                correctOptionDetected = true;
            }
            postOptions.push({value: options[i].name, correct: options[i].value, responses: 0});
        }

        if(!correctOptionDetected){
            return res.status(400).json({ error: "Error(214) Invalid post options." });
        }
    }


    if(type === "slider"){
      if(options.length !== 2){
          return res.status(400).json({ error: "Error(215) Invalid post options." });
      }

      for(let i=0; i < options.length; i++){
          if(typeof(options[i].value) !== "number" || typeof(options[i].name) !== "string"){
              return res.status(400).json({ error: "Error(215.1) Invalid post options." });
          }
          postOptions.push({value: options[i].name, number: options[i].value, responses: 0});
      }
  }
    let slug = "post-";
  
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const charactersLength = characters.length;

    for (let i = 0; i < 15; i++) {
      slug += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const postSlug = slugify(slug, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
      })

    const regex = /#(\w+)/g;
    const postHashtags = [];
    let match;
    while ((match = regex.exec(caption)) !== null) {
        postHashtags.push(match[1]);
    }

    try{

        if(isSponsored === true){
          user.tokenAmount = user.tokenAmount - 20;
          visibility = "public";
        }

        if(postHashtags.length >= 1){
            for(let i=0; i < postHashtags.length; i++){
                
                const profanityFlag = await isProfanity(postHashtags[i].trim().split(/\s+/));

                if(profanityFlag){
                    return res.status(400).json({ error: "Error(216) Hashtag profanity not allowed." });
                }
            }
        }
        const newPost = await Post.create({
            userId,
            caption,
            type,
            options: postOptions,
            visibility,
            responses: 0,
            likes: 0,
            likesUserId: [],
            comments: [],
            shares: 0,
            slug: postSlug,
            hashtags: postHashtags,
            edited: false,
            isSponsored,
        });
      
        if (!newPost) {
          return res.status(400).json({ error: "Error(217) Error creating post. Check database." });
        }
        

        const postObject = {
          userId,
          postId: newPost._id,
        }

        user.posts.push(postObject);
        await user.save();

        return res.status(200).json({ message: "Post created successfully."});
    } catch (err) {
        return res.status(500).json({ error: "Error(218) Internal server error." });
    }
}

export const addResponse = async (req, res) => {
    const { userId, postId, index } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ error: "Error(219) Invalid user or post id." });
      }
    
      const user = await User.findById(userId);
      const post = await Post.findById(postId);
    
      if (!user) {
        return res.status(404).json({ error: "Error(220) User not found." });
      } 

      if (!post) {
        return res.status(404).json({ error: "Error(221) Post not found." });
      }

      try{
        post.options[index].responses = post.options[index].responses +1;
        post.responses = post.responses + 1;
        await post.save();

        return res.status(200).json({ message: "Response added successfully."});

      } catch (err) {
        return res.status(500).json({ error: "Error(222) Internal server error." });
      }
}

export const deletePost = async (req, res) => {
  const { postId } = req.body;

  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Error(223) Invalid post id." });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ error: "Error(224) Post not found." });
  }

  try {
    // Remove the post from users' posts arrays
    const users = await User.find({ posts: { $elemMatch: { postId } } });
    users.forEach(async (user) => {
      user.posts = user.posts.filter((postObj) => postObj.postId.toString() !== postId);
      await user.save();
    });

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully." });

  } catch (err) {
    return res.status(500).json({ error: "Error(225) Internal server error." });
  }
};

export const deleteSharedPost = async (req, res) => {
  const { userId, postId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Error(225.1) Invalid user or post id." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Error(225.2) User not found." });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ error: "Error(225.3) Post not found." });
  }

  try {
    // Remove the post from user's posts arrays
    user.posts = user.posts.filter((postObj) => postObj.postId.toString() !== postId);
    await user.save();

    return res.status(200).json({ message: "Post deleted successfully from user's shared posts." });

  } catch (err) {
    return res.status(500).json({ error: "Error(225.4) Internal server error." });
  }
};

export const editCaption = async (req,res) => {
    const { userId, postId, newCaption } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ error: "Error(226) Invalid user or post id." });
    }
    
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
    
    if (!user) {
      return res.status(404).json({ error: "Error(227) User not found." });
    } 

    if (!post) {
      return res.status(404).json({ error: "Error(228) Post not found." });
    }

    if(post.userId !== userId){
      return res.status(400).json({ error: "Error(229) Unauthorized caption edit." });
    }

    const profanityFlag = await isProfanity(newCaption.trim().split(/\s+/));
    
    if(profanityFlag){
      return res.status(400).json({ error: "Error(230) Profanity is not allowed." });
    }

    try{
        post.caption = newCaption;
        post.edited = true;
        await post.save();
                
        return res.status(200).json({ message: "Caption edited successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(231) Internal server error." });
    }
}

export const addLike = async (req,res) => {
    
    const { userId, postId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ error: "Error(232) Invalid user or post id." });
    }
  
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
  
    if (!user) {
      return res.status(404).json({ error: "Error(233.1) User not found." });
    } 

    if (!post) {
      return res.status(404).json({ error: "Error(234.1) Post not found." });
    }

    try{
        post.likes = post.likes +1;
        post.likesUserId.push(userId),
        await post.save();

        return res.status(200).json({ message: "Like added successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(234) Internal server error." });
    }
}

export const removeLike = async (req,res) => {
  const { userId, postId } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Error(234.1) Invalid user or post id." });
  }

  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user) {
    return res.status(404).json({ error: "Error(234.2) User not found." });
  } 

  if (!post) {
    return res.status(404).json({ error: "Error(234.3) Post not found." });
  }

  try{
      post.likes = post.likes -1;
      post.likesUserId.filter((id) => id !== userId),
      await post.save();

      return res.status(200).json({ message: "Like removed successfully."});

  } catch (err) {
      return res.status(500).json({ error: "Error(234.4) Internal server error." });
  }
}

export const addShare = async (req,res) => {
    const { postId, userId } = req.body;

    if (!mongoose.isValidObjectId(postId) || !!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(235) Invalid post or user id." });
    }

    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ error: "Error(236) Post or user not found." });
    }

    const postObject = {
      postId,
      userId,
    }

    try{
        post.shares = post.shares +1;
        await post.save();

        user.posts.push(postObject);
        await user.save();
        

        return res.status(200).json({ message: "Share added successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(237) Internal server error." });
    }
}


export const addComment = async (req,res)=>{
    const {postId, commentId} = req.body;
    
    if(!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)){
        return res.status(400).json({ error: "Error(238) Invalid post or comment id input."});
    }
    
    const post = await Post.findById(postId);
    const comment = await Comment.findById(commentId);
    
    if(!post || !comment){
      return res.status(404).json({ error: "Error(239) Post or comment not found."});
    }
    
   try{
      if(!post.comments.includes(commentId)){
          post.comments.push(commentId);
          await post.save();

          return res.status(200).json({ message: "Comment added successfully." });

      } else {
          return res.status(400).json({ error: "Error(240) Comment already added to post." });
      }
    } catch (err) {
        return res.status(500).json({ error: "Error(241) Internal server error."});
    }
  }
//////////////////////////////////////////////////////////////////////////////////
  // export const getPublicPosts = async (req, res) => {
  //   try {
  //     let publicPosts = await Post.find({ visibility: "public" })
  //                                 .populate({
  //                                   path: "comments",
  //                                   populate: {
  //                                     path: "userId",
  //                                     model: "User"
  //                                   }
  //                                 }).exec();
  //     return res.status(200).json(publicPosts);
  //   } catch (error) {
  //     return res.status(500).json({ error: "Error(242) Internal server error.", error: error});
  //   }
  // };

  export const getPublicPosts = async (req, res) => {
    try {
      let publicPosts = await Post.find({ visibility: "public" })
                                    .populate({
                                      path: "comments",
                                      populate: {
                                        path: "userId",
                                        model: "User"
                                      },
                                      // Populate replies array in CommentModel
                                      populate: {
                                        path: "replies",
                                        model: "CommentModel",
                                        populate: {
                                          path: "userId",
                                          model: "User"
                                        }
                                      }
                                    }).exec();
      return res.status(200).json(publicPosts);
    } catch (error) {
      return res.status(500).json({ error: "Error(242) Internal server error.", error: error});
    }
  };



  export const getFriendsPrivatePosts = async (req, res) => {
    const {userId} = req.body;
    
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({ error: "Error(243) Invalid user id."});
    }
    
    const validUser = await User.findById(userId);
    
    if(!validUser){
      return res.status(404).json({ error: "Error(244) User not found."});
    }


    try {
      const user = await User.findById(userId).populate({
        path: 'community.friendId',
        populate: {
          path: 'posts',
          match: { visibility: 'private' },
        },
      });
  
      const privatePosts = user.community.reduce((acc, friend) => {
        if (friend.posts && friend.posts.length > 0) {
          acc = acc.concat(friend.posts);
        }
        return acc;
      }, []);
  
      return res.status(200).json(privatePosts);
    } catch (error) {
      return res.status(500).json({ error: "Error(245) Internal server error."});
    }
  };


  export const getUserPosts = async (req, res) => {
    const {userId} = req.body;
    
    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({ error: "Error(246) Invalid user id."});
    }
    
    const user = await User.findById(userId);
    
    if(!validUser){
      return res.status(404).json({ error: "Error(247) User not found."});
    }

    try{
    const postIds = user.posts.map(post => post.postId);
    const userPosts = await Post.find({ _id: { $in: postIds } });

    return res.status(200).json(userPosts);

    } catch (err) {
      return res.status(500).json({ error: "Error(248) Internal server error."});
    }
  };


  //get friends posts
  //get public posts
  //get my posts
  