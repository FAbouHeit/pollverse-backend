import mongoose from 'mongoose';
import { typeVerify } from './Notification.Verify.js';

const notificationSchema = new mongoose.Schema({
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
        enum: ["addRequest", "postLike", "postShare", "postComment", "postExpiration", "accountVerification", "reportMessage"],
        required: true,
        validate: {
            validator: typeVerify,
            message: "Invalid notification type."
        }
    },
  },{timestamps: true});
  
  const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;