//get all comments from array?

import Post from "../Models/PostModel/Post.Model.js";
import Comment from "../Models/CommentModel/Comment.Model.js"
import mongoose from "mongoose";

export const createComment = async (req, res) => {
    const { userId, text, type, parentId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ error: "Error(301) Invalid comment or parent id." });
    }

    const types = ["comment", "reply"];

    if(!text || !types.includes(type)){
        return res.status(400).json({ error: "Error(302) Invalid comment inputs." });
    }

    const profanityFlag = await isProfanity(text.trim().split(/\s+/));

    if(profanityFlag){
        return res.status(400).json({ error: "Error(303) Profanity is not allowed." });
    }

    if(type === "comment"){
        const post = await Post.findById(parentId);
        if(!post){
            return res.status(404).json({ error: "Error(304) Parent not found." });
        }
    }

    if(type === "reply"){
        const comment = await Comment.findById(parentId);
        if(!comment){
            return res.status(404).json({ error: "Error(305) Parent not found." });
        }
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
          return res.status(400).json({ error: "Error(306) Error creating comment. Check database." });
        }

        return res.status(200).json({ message: "Post created successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(307) Internal server error."});
    }
}

export const editComment = async (req,res) => {
    const { commentId, text } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ error: "Error(308) Invalid comment id." });
    } 

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({ error: "Error(309) Comment not found." });
    }

    const profanityFlag = await isProfanity(text.trim().split(/\s+/));

    if(profanityFlag){
        return res.status(400).json({ error: "Error(310) Profanity is not allowed." });
    }

    try{
        comment.text = text;
        await comment.save();

        return res.status(200).json({ message: "Comment edited successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(311) Internal server error."});
    }

}


export const deleteComment = async (req,res) => {
    const { commentId } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ error: "Error(312) Invalid comment id." });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Error(313) Comment not found." });
    }

    try{
        await Comment.findByIdAndDelete(commentId);
                
        return res.status(200).json({ message: "Comment deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(314) Internal server error." });
    }
}


export const getAllComments = async (req,res) => {

    try{
        const comments = await Comment.find();
        
        return res.status(200).json(comments);

      } catch (error) {
        return res.status(500).json({ error: "Error(315) Internal server error." });
      }
}