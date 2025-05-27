import JWT from "jsonwebtoken";

export const userAuth = async (req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false, message:"User not logged in"});
    }

    try {
        
        const tokenDecoded = JWT.verify(token, process.env.JWT_SECRET);

        if(tokenDecoded.id){
            req.body.userId - tokenDecoded.id;
        } else{
            return res.json({success:false, message:"User not logged in"});
        }

        next();

    } catch (error) {
        return res.json({success:false, message:"User not logged in"});
    }
}