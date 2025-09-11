import jwt from 'jsonwebtoken';
import pool from '../db.js';

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if(!token){
        return res.status(400).json({"message": "Invalid or missing token"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query("SELECT * FROM user_auth WHERE user_id=$1", [decoded.userID]);
        if(user.rows.length === 0){
            return res.status(400).json({"message": "User not found"});
        }

        if(user.rows[0].email_verified){
            return res.status(400).json({"message": "Email already verified"});
        }

        await pool.query("UPDATE user_auth SET email_verified=true WHERE user_id=$1", [decoded.userID]);

        return res.json({"message": "Email verified successfully"});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}