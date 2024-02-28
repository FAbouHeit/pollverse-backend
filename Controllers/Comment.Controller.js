//get all comments from array?
//deleteComment

import Post from "../Models/PostModel/Post.Model.js";
import Comment from "../Models/CommentModel/Comment.Model.js"
import mongoose from "mongoose";
import User from "../Models/UserModel/User.Model.js";
import recursiveDelete from "../Utils/recursiveDelete.js";
import { isProfanity } from "../Utils/ProfanityCheck/profanityCheck.js";

export const createComment = async (req, res) => {
    const { userId, text, type, parentId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ error: "Error(301) Invalid comment or parent id." });
    }

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({ error: "Error(302) User not found." });
    }

    const types = ["comment", "reply"];

    if(!text || !types.includes(type)){
        return res.status(400).json({ error: "Error(303) Invalid comment inputs." });
    }

    const profanityFlag = await isProfanity(text.trim().split(/\s+/));

    if(profanityFlag){
        return res.status(400).json({ error: "Error(304) Profanity is not allowed." });
    }
    let parentPost;
    let parentComment;

    if(type === "comment"){
        const post = await Post.findById(parentId);
        if(!post){
            return res.status(404).json({ error: "Error(305) Parent not found." });
        }
        parentPost = post;
    }

    if(type === "reply"){
        const comment = await Comment.findById(parentId);
        if(!comment){
            return res.status(404).json({ error: "Error(306) Parent not found." });
        }
        parentComment = comment;
    }

    try{
        const newComment = await Comment.create({
            userId,
            text,
            type,
            parentId,
            replies: [],
        });
        
      
        if (!newComment) {
          return res.status(400).json({ error: "Error(307) Error creating comment. Check database." });
        }

        if(parentPost){
            const commentsArray = [...parentPost.comments];
            commentsArray.push(newComment);
            parentPost.comments = commentsArray;
            await parentPost.save();
        }

        if(parentComment){
            const commentsArray = [...parentComment.replies];
            commentsArray.push(newComment);
            parentComment.replies = commentsArray;
            await parentComment.save();
        }

        return res.status(200).json({ message: "Comment created successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(308) Internal server error."});
    }
}

export const editComment = async (req,res) => {
    const { commentId, text } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ error: "Error(309) Invalid comment id." });
    } 

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({ error: "Error(310) Comment not found." });
    }

    const profanityFlag = await isProfanity(text.trim().split(/\s+/));

    if(profanityFlag){
        return res.status(400).json({ error: "Error(311) Profanity is not allowed." });
    }

    try{
        comment.text = text;
        await comment.save();

        return res.status(200).json({ message: "Comment edited successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(312) Internal server error."});
    }

}


export const deleteComment = async (req,res) => {
    const { commentId } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ error: "Error(313) Invalid comment id." });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Error(314) Comment not found." });
    }

    try{
        await Comment.findByIdAndDelete(commentId);

        recursiveDelete(commentId);
                
        return res.status(200).json({ message: "Comment deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(315) Internal server error." });
    }
}


export const getAllComments = async (req,res) => {

    try{
        const comments = await Comment.find();
        
        return res.status(200).json(comments);

      } catch (error) {
        return res.status(500).json({ error: "Error(316) Internal server error." });
      }
}

export const getCommentById = async (req,res)=>{
    const commentId = req.body.commentId;

    if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ error: "Error(317) Invalid comment id." });
    }

    try{
        const comment = await Comment.findById(commentId);
        return res.status(200).json(comment);
    } catch(err){
        return res.status(500).json({ error: "Error(318) Internal server error." });
    }

    
}