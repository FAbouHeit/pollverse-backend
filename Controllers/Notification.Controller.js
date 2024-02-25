import mongoose from "mongoose";
import User from "../Models/UserModel/User.Model.js";
import Notification from "../Models/NotificationModel/Notification.Model.js";

//add one
export const addNotification = async (req,res) => {
    const {userId, notification} = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(501) Invalid user id." });
    }

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({ error: "Error(502) User not found." });
    }

    const notifications = ["addRequest", "postLike", "postShare", "postComment", "postExpiration", "accountVerification", "reportMessage", "tokensSpent"];

    if(!notification || !notifications.includes(notification)){
        return res.status(404).json({ error: "Error(503) Invalid activity." });
    }

    try{
        switch (notification) {
            case "addRequest":
                await Notification.create({
                    userId,
                    text: "Sent an Add Request",
                    activity,
                })                
                break;
            case "postLike":
                await Notification.create({
                    userId,
                    text: "Liked your post",
                    activity,
                })                
                break;
            case "postShare":
                await Notification.create({
                    userId,
                    text: "Shared your post",
                    activity,
                })                
                break;
            case "postComment":
                await Notification.create({
                    userId,
                    text: "Commented on your post",
                    activity,
                })                
                break;
            case "postExpiration":
                await Notification.create({
                    userId,
                    text: "Post expired",
                    activity,
                })                
                break;
            case "accountVerification":
                await Notification.create({
                    userId,
                    text: "Account verified successfully",
                    activity,
                })                
                break;
            case "reportMessage":
                    await Notification.create({
                        userId,
                        text: "Action has been taken on a post you have reported",
                        activity,
                    })                
                    break;
            case "tokensSpent":
                    await Notification.create({
                        userId,
                        text: "You have spent tokens",
                        activity,
                    })                
                    break;
        
            default:
                break;
        }

        return res.status(200).json({ message: "Activity added successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(504) Internal server error." });
    }
}

export const deleteNotification = async (req,res) => {
    const { notificationId } = req.body;

    if (!mongoose.isValidObjectId(notificationId)) {
        return res.status(400).json({ error: "Error(505) Invalid notification id." });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Error(506) Notification not found." });
    }

    try{
        await Notification.findByIdAndDelete(notificationId);
                
        return res.status(200).json({ message: "Notification deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(507) Internal server error." });
    }
}

export const deleteAllNotifications = async (req,res) => {
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(508) Invalid notification id." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Error(509) User not found." });
    }

    try {
        await Notification.deleteMany({ userId });

        return res.status(200).json({ message: "All notifications deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(510) Internal server error." });
    }
  };