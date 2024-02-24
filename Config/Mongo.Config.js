import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGO_URI;

const connect = async () =>{

    try{
        await mongoose.connect(URI);
        console.log("Connected to MongoDB...")
    } catch(error){
        throw error;
    }
}

export default connect;