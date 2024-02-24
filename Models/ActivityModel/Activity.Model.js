import mongoose from 'mongoose';
import { typeVerify } from './Activity.Verify.js';

const ActivityModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 120,
    },
    type: {
        type: String,
        enum: ["addRequest", "postLike", "postShare", "postComment", "report"],
        required: true,
        validate: {
            validator: typeVerify,
            message: "Invalid notification type."
        }
    },
  },{timestamps: true});
  
export const Activity = mongoose.model('Activity', ActivityModel);
