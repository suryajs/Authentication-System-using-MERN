import express from "express";
import userAuth from "../Middleware/userAuth.js";
import { getUsers } from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUsers);

export default userRouter;