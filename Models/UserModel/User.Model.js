import mongoose from "mongoose";
import { ageVerify, emailVerify, roleVerify } from "./User.Verify.js";

// const mapSchema = new mongoose.Schema({
//   key: {
//     type: String,
//     required: true,
//   },
//   value: {
//     type: Number,
//     required: true,
//   },
// });


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: emailVerify,
        message: "Invalid email format.",
      },
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: ageVerify,
        message: "Not over 13 years old.",
      },
    },
    gender: {
      type: String,
      required: false,
      enum: ["male", "female", "unspecified"]
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    tokenAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    isActivated: {
      type: Boolean,
      required: true,
    },
    community: [{
        friendId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Users",
        },
        roomId: {
          type: String,
          required: false,
        }
    }],
    friendReqSent:[{
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }],
    friendReqReceived:[{
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }],
    profilePic: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      validate: {
        validator: roleVerify,
        message: "Invalid Role.",
      },
    },
    userMap: {
      type: Map,
      // of: mapSchema,
      required: false,
    },
    activationCode: {
      type: String,
      required: false,
    },
    activationCodeCreatedAt: {
      type: Date,
      required: false,
    },
    likedPosts : [{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }],
    respondedPosts:[{
      type: {
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        optionIndex: {
          type: Number,
          required: true,
        }
      },
      required: true,
    }],
    posts: [{
      type: {
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
      required: true,
    }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
