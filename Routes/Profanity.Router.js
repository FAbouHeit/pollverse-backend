import express from "express";
import { isProfanity } from "../Utils/ProfanityCheck/profanityCheck.js";

const fetchIsProfanity = async (req, res) =>{
    const  array  = req.body.array || [];
    if(array.length > 0){
        const profanityFlag = await isProfanity(array);
        if(profanityFlag){
            return res.status(200).json({answer: true});

        } else {
            return res.status(200).json({answer: false});
        }
    } else {
        return
    }
}

  const profanityRouter = express.Router();
  
  profanityRouter.post("/", fetchIsProfanity);
  
  export default profanityRouter;
  
  
  