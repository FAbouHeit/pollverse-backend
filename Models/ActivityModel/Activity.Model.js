import mongoose from 'mongoose';
import { typeVerify } from './Activity.Verify.js';

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 120,
    },
    activity: {
        type: String,
        enum: ["addRequest", "postLike", "postShare", "postComment", "report"],
        required: true,
        validate: {
            validator: typeVerify,
            message: "Invalid notification type."
        }
    },
  },{timestamps: true});
  
  const Activity = mongoose.model('Activity', activitySchema);

export default Activity;

