//create transaction
//approve transaction
//reject transaction
import mongoose from 'mongoose';
import Transaction from '../Models/TransactionModel/Transaction.Model.js'
import User from '../Models/UserModel/User.Model.js';

export const createTransaction = async (req,res) =>{
    const {userId, amount} = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Error(601) Invalid user id." });
    }

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({ error: "Error(602) User not found." });
    }

    if(!(amount && Number(amount) && amount > 0 && amount < 99 )){
        return res.status(400).json({ error: "Error(603) Invalid amount input." });
    }

    try{
        if(user.tokenAmount >= amount){
        user.tokenAmount = user.tokenAmount - amount;

        await user.save();

        await Transaction.create({
            userId,
            amount,
            status: "pending",
        })

        return res.status(200).json({ message: "Transaction created successfully."});
        } else {
        return res.status(400).json({ error: "Error(604) Insufficient token amount." });
        }

    } catch (err) {
        return res.status(500).json({ error: "Error(605) Internal server error." });
    }
}

export const changeTransactionStatus = async (req, res) =>{
    const {userId, transactionId, newStatus} = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(transactionId)) {
        return res.status(400).json({ error: "Error(606) Invalid user or transaction id." });
    }

    const user = await User.findById(userId);
    const transaction = await Transaction.findById(transactionId);

    if(!user){
        return res.status(404).json({ error: "Error(607) User not found." });
    }
    
    if(!transaction){
        return res.status(404).json({ error: "Error(608) Transaction not found." });
    }

    if(transaction.userId !== userId){
        return res.status(400).json({ error: "Error(609) Invalid user id." });
    }

    const statuses = ["approved", "pending"];

    if(!isString(newStatus) || !statuses.includes(newStatus)){
        return res.status(400).json({ error: "Error(610) Invalid new status." });
    }

    try{

        if(newStatus === "approved" && transaction.status !== "approved"){
            transaction.status = "approved";
            await transaction.save();   
            return res.status(200).json({ message: "Transaction approved successfully."});
        } else if(newStatus === "rejected" && transaction.status !== "rejected") {
            transaction.status = "rejected";
            user.tokenAmount = user.tokenAmount + transaction.amount;
            await user.save();
            await transaction.save();   
            return res.status(200).json({ message: "Transaction approved successfully."});  
        } else {
        return res.status(400).json({ error: "Error(611) Invalid new status, possibly already updated." });
        }

    } catch (err) {
        return res.status(500).json({ error: "Error(612) Internal server error." });
    }
}