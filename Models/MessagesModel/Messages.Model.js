import mongoose from 'mongoose';

const chatModel = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
  },{timestamps: true});
  
export const Chat = mongoose.model('Chat', chatModel);
