import mongoose from 'mongoose';
import { typeVerify } from './Transaction.Verify.js';

const TransactionModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        max: 99,
        min: 0,
    },
    status: {
        type: String,
        enum: ["approved", "pending"],
        required: true,
        validate: {
            validator: statusVerify,
            message: "Invalid transaction status."
        }
    },
  },{timestamps: true});
  
export const Transaction = mongoose.model('Transaction', TransactionModel);
