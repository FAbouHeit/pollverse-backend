//delete one
//delete all

import mongoose from "mongoose";
import User from "../Models/UserModel/User.Model.js";
import Activity from "../Models/ActivityModel/Activity.Model.js";

//add one
export const addActivity = async (req,res) => {
    const {userId, activity} = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(401) Invalid user id." });
    }

    const user = User.findById(userId);

    if(!user){
        return res.status(404).json({ error: "Error(402) User not found." });
    }

    const activities = ["addRequest", "postLike", "postShare", "postComment", "report"];

    if(!activity || !activities.includes(activity)){
        return res.status(404).json({ error: "Error(403) Invalid activity." });
    }

    try{
        switch (activity) {
            case "addRequest":
                await Activity.create({
                    userId,
                    text: "Sent an Add Request",
                    activity,
                })                
                break;
            case "postLike":
                await Activity.create({
                    userId,
                    text: "Liked a post",
                    activity,
                })                
                break;
            case "postShare":
                await Activity.create({
                    userId,
                    text: "Shared a post",
                    activity,
                })                
                break;
            case "postComment":
                await Activity.create({
                    userId,
                    text: "Added a comment",
                    activity,
                })                
                break;
            case "report":
                await Activity.create({
                    userId,
                    text: "Reported a post",
                    activity,
                })                
                break;
        
            default:
                break;
        }

        return res.status(200).json({ message: "Activity added successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(404) Internal server error." });
    }
}

export const deleteActivity = async (req,res) => {
    const { activityId } = req.body;

    if (!mongoose.isValidObjectId(activityId)) {
        return res.status(400).json({ error: "Error(405) Invalid activity id." });
    }

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ error: "Error(406) Activity not found." });
    }

    try{
        await Activity.findByIdAndDelete(activityId);
                
        return res.status(200).json({ message: "Activity deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(407) Internal server error." });
    }
}

export const deleteAllActivities = async (req,res) => {
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(408) Invalid activity id." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Error(409) Activity not found." });
    }

    try {
        await Activity.deleteMany({ userId });

        return res.status(200).json({ message: "All activities deleted successfully."});

    } catch (err) {
        return res.status(500).json({ error: "Error(410) Internal server error." });
    }
  };