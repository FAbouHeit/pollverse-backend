//sendMessage

import mongoose from "mongoose";
import User from "../Models/UserModel/User.Model.js";
import Chat from "../Models/ChatModel/Chat.Model.js";

export const sendMessage = async (req,res) =>{
    const {text, senderId, roomId} = req.body;

    if (!mongoose.isValidObjectId(senderId)) {
        return res.status(400).json({ error: "Error(701) Invalid sender id." });
    }

    const sender = await User.findById(senderId);

    if(!sender){
        return res.status(404).json({ error: "Error(702) User not found." });
    }

    if(!text || !isString(text) || text.length > 500){
        return res.status(400).json({ error: "Error(703) Invalid text input." });
    }

    if(!roomId || !isString(roomId)){
        return res.status(400).json({ error: "Error(704) Invalid room id." });
    }

    try{
        await Chat.create({
            text,
            senderId,
            roomId,
        });
        return res.status(200).json({ message: "Message created successfully." });
    } catch (err) {
        return res.status(400).json({ error: "Error(705) Internal server error." });
    }
}

export const deleteMessagesByRoomId = async (req,res) =>{
    try {
        const { roomId } = req.body;
    
        if (!roomId) {
          return res.status(400).json({ error: "Error(706) Invalid room id." });
        }
    
        const deletedChats = await Chat.deleteMany({ roomId });
    
        if (!deletedChats) {
          return res.status(404).json({ error: "Error(707) Error deleting messages." });
        }
    
        res.status(200).json({ message: 'All chats deleted successfully.' });

      } catch (err) {
        res.status(500).json({ error: "Error(708) Internal server error." });
      }
}