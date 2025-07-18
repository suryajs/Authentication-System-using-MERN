import express from "express";
import { isAuthenticated, login, logout, register, resetPassword, sendPasswordResetOtp, sendVerificationOtp, verifyEmail } from "../Controllers/authController.js";
import userAuth  from "../Middleware/userAuth.js";


export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/sendVerifyOtp", userAuth, sendVerificationOtp);
authRouter.post("/verifyEmail", userAuth, verifyEmail);
authRouter.get("/isAuthenticated", userAuth, isAuthenticated);
authRouter.post("/sendPasswordResetOtp", sendPasswordResetOtp);
authRouter.post("/resetPassword", resetPassword);