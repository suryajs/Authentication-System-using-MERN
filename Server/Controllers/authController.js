import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing details" })
    }

    try {

        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

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

        return res.json({ success: true, message: "Registration successful" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" })
    }

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({ success: true, message: "Login successful" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
        })

        return res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        return
    }
}

// Send verification otp
export const sendVerificationOtp = async (req, res) => {
    console.log("Reached sendVerificationOtp");
    try {
        const  userId  = req.userId;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified" })
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

        return res.json({ success: true, message: "OTP sent successfully" })

    } catch (error) {

    }
}

// Verify email using OTP
export const verifyEmail = async (req, res) => {

    const userId = req.userId;
    const otp = req.body.otp;
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing details" })
    }
    try {

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" })
        }

        if (user.verifyOtpExpiredAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiredAt = 0;

        await user.save();

        return res.json({ success: true, message: "Email verified successfully" })

    } catch (error) {
        return res.json({ success: false, message: error.message })

    }
}

// Check if user is authenticated
export const isAuthenticated = async(req, res) =>{
    try{
        return res.json({success:true, message:"User is authenticated"});
    }catch(error){
        res.json({success:false, message:error.message})
    }
}

// Send Password Reset OTP
export const sendPasswordResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset your password",
            text: `Hello ${user.name},\n\nPlease use the following OTP to reset your password: ${otp}\n\nBest,\nYour Team`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP sent successfully" })
        
    }catch(error){
        return res.json({success:false, message:error.message})
    }
}

// Reset Password
export const resetPassword = async (req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false, message:"Missing details"});
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:"User does not exist"});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success:false, message:"Invalid OTP"});
        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({success:false, message:"OTP expired"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiredAt = 0;

        await user.save();

        return res.json({success:true, message:"Password reset successfully"});

    } catch(error){
        return res.json({success:false, message:error.message})
    }
}