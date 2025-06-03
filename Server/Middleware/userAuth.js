import jwt from "jsonwebtoken";

const userAuth = async (req,res,next) => {
    const { token } = req.cookies;

    if(!token){
        return res.status(401).json({success:false, message:"Not Authorized. Login again!"});
    }

    try {
        
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!tokenDecoded?.id){
            return res.status(401).json({ success: false, message: "Invalid token" });
        } 

        req.userId = tokenDecoded.id;
        next();

    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.json({success:false, message:error.message});
    }
}

export default userAuth