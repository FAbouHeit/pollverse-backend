import mongoose from "mongoose";
import Comment from "../Models/CommentModel/Comment.Model";

export const getUserComments = async (userId) => {
    const commentIds = await Comment.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          commentIds: {
            $push: '$_id',
          },
        },
      },
    ]);
  
    return commentIds.length > 0 ? commentIds[0].commentIds : [];
  };