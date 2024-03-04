import express from 'express';
import { 
    search,
} from "../Controllers/Search.Controller.js";

const searchRouter = express.Router();

searchRouter.post('/', search);

export default searchRouter;