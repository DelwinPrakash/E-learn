import jwt from "jsonwebtoken";
import UserSession from "../models/UserSession.js";

const verifyJWT = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if(!token) return res.status(401).json({"message": "No token found, unauthorized!"});

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user_session = await UserSession.findOne({ where: { session_id: decode.session } });
        
        if(!user_session) return res.status(401).json({"message": "Session not found, unauthorized!"});
        
        req.user = user_session;
        next();
    }catch(error){
        return res.status(401).json({"message": "Token verification failed, unauthorized!"});
    }
}

export { verifyJWT };