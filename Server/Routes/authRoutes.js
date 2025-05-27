import express from "express";
import { login, logout, register, sendVerificationOtp, verifyEmail } from "../Controllers/authController.js";
import { userAuth } from "../Middleware/userAuth.js";


export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/sendVerifyOtp", userAuth, sendVerificationOtp);
authRouter.post("/verifyEmail", userAuth, verifyEmail);
