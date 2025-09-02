import jwt from 'jsonwebtoken';
import pool from '../db.js';

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if(!token){
        return res.status(400).json({"message": "Invalid or missing token"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query("SELECT * FROM users WHERE email=$1", [decoded.email]);
        if(user.rows.length === 0){
            return res.status(400).json({"message": "User not found"});
        }

        // if(user.rows[0].is_verified){
        //     return res.status(400).json({"message": "Email already verified"});
        // }

        // await pool.query("UPDATE users SET is_verified=true WHERE email=$1", [decoded.email]);

        return res.json({"message": "Email verified successfully"});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}