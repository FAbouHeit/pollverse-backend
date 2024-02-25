import express from "express";
// import { authenticate } from "../middleware/Auth.js";
import {
    createTransaction,
    changeTransactionStatus,
} from "../Controllers/Transaction.Controller.js";

  
  const transactionRouter = express.Router();
  
  transactionRouter.post("/create", createTransaction);
  transactionRouter.patch("/change-status", changeTransactionStatus);
  
  export default transactionRouter;
  
  
  