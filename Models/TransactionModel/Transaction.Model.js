import mongoose from 'mongoose';
import { statusVerify } from './Transaction.Verify.js';

const transactionSchema = new mongoose.Schema({
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
        enum: ["approved", "pending", "rejected"],
        required: true,
        validate: {
            validator: statusVerify,
            message: "Invalid transaction status."
        }
    },
  },{timestamps: true});
  
  const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;