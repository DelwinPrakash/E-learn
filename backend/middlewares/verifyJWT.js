import jwt from "jsonwebtoken";
import pool from "../config/db";

const verifyJWT = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if(!token) return res.status(401).json({"message": "No token found, unauthorized!"});

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user_session = await pool.query("SELECT * FROM user_session WHERE session_id = $1", [decode.session_id]);

        if(user_session.rows.length === 0) return res.status(401).json({"message": "Session not found, unauthorized!"});
        
        req.user = user_session.rows[0];
        next();
    }catch(error){
        return res.status(401).json({"message": "Token verification failed, unauthorized!"});
    }
}

export default verifyJWT;