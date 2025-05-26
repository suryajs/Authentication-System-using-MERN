import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req,res) => {
    const {name, email, password} = req.body

    if(!name || !email || !password){
        return res.json({success:false ,message: "Missing details"})
    }

    try{

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false ,message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000           
        })

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to our app!",
            text: `Hello ${name},\n\nWelcome to our app! We're excited to have you join us.\n\nBest,\nYour Team`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({success:true ,message: "Registration successful"})

    }catch(error){
        res.json({success:false ,message: error.message})
    }
}

export const login = async (req,res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success:false ,message: "Email and password are required"})
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false ,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false ,message: "Incorrect password"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000           
        })

        return res.json({success:true ,message: "Login successful"})

    }catch(error){
        return res.json({success:false ,message: error.message})
    }
}

export const logout = async (req,res) => {
    try{

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",     
        })

        return res.json({success:true ,message: "Logged out successfully"})
    }catch(error){
        return
    }
}

// Send verification otp
export const sendVerificationOtp = async (req,res) => {
    try{
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success:false ,message: "Account Already Verified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your account",
            text: `Hello ${user.name},\n\nPlease use the following OTP to verify your account: ${otp}\n\nBest,\nYour Team`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({success:true ,message: "OTP sent successfully"})

    }catch(error){

    }
}

export const verifyEmail = async (req,res) => {
    try{

        const { userId, otp } = req.body;

        if(!userId || !otp){
            return res.json({success:false ,message: "Missing details"})
        }
    }catch(error){

    }
}