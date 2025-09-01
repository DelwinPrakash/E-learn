import jwt from "jsonwebtoken";
import pool from "../config/db";

const verifyJWT = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if(!token) return res.status(401).json({"message": "No token found, unauthorized!"});

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [decode.user_id]);

        if(user.rows.length === 0) return res.status(401).json({"message": "User not found, unauthorized!"});
        
        req.user = user.rows[0];
        next();
    }catch(error){
        return res.status(401).json({"message": "Token verification failed, unauthorized!"});
    }
}

export default verifyJWT;