import mongoose from "mongoose";
import { typeVerify, visibilityVerify } from "./Post.Verify.js";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    caption: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 120,
    },
    type: {
      type: String,
      required: true,
      enum: ["twoChoice", "multiChoice", "quiz", "slider"],
      validate: {
        validator: typeVerify,
        message: "Invalid post format.",
      },
    },
    options: {
      type: [{
        value: {
          type: String,
          required: true
        },
        correct: {
          type: Boolean,
          required: function () {
            return this.type === 'quiz'; // Only required for quiz type
          }
        },
        responses: {
          type: Number,
          required: true,
          min: 0
        }
      }],
      validate: {
        validator: function (options) {
          if (this.type === 'twoChoice' || this.type === 'slider') {
            return options.length === 2;
          } else if (this.type === 'multiChoice') {
            return options.length >= 3 && options.length <= 10;
          } else if (this.type === 'quiz') {
            return options.length === 4;
          }
          return false;
        },
        message: "Invalid options format."
      }
    },
    visibility: {
      type: String,
      required: true,
      enum: ["public", "private"],
      validate: {
        validator: visibilityVerify,
        message: "Invalid post format.",
      },
    },
    responses: {
      type: Number,
      required: true,
      min: 0
    },
    likes: {
      type: Number,
      required: true,
      min: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentModel',
    }],
    shares: {
      type: Number,
      required: true,
      min: 0
    },
    slug: {
      type: String,
      required: false,
      unique: true,
    },
    hashtags: {
      type: [String],
      required: false,
    },
    edited: {
      type: Boolean,
      required: true,
    },
    isSponsored: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
