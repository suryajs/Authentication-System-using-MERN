import userModel from "../models/userModel.js";

export const getUsers = async (req, res) => {
    try {

        const userID  = req.userId;
        const user = await userModel.findById(userID);

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}