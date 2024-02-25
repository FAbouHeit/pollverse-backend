import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    }
  },{timestamps: true});
  
const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
