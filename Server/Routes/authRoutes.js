import express from "express";
import { login, logout, register } from "../Controllers/authController.js";


export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
