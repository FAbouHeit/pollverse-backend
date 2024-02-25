import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ['comment', 'reply'],
        message: "Invalid comment type.",
      },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      replies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentModel',
        required: false,
      }],
    },
    {
      timestamps: true,
    }
  );

const Comment = mongoose.model('CommentModel', commentSchema);

export default Comment;
