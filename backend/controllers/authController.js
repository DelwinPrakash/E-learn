import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try{
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if(existingUser.rows.length === 0){
            return res.status(401).json({"message": "User not found! sign up instead"});
        }

        const user = existingUser.rows[0];

        const passwordMatch = bcrypt.compare(password, user.password);
        if(!passwordMatch) return res.status(400).json({"message": "Invalid credentials!"});

        const token = jwt.sign({
            userID: user.user_id,
            email: user.email
        },  process.env.JWT_SECRET,{
            expiresIn: "1h"
        });

        return res.json({
            token,
            user
        });

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

const handleRegister = async (req, res) => {
    const { email, password } = req.body;

    try{
        const duplicateUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if(duplicateUser > 0){
            return res.status(400).json({"message": "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email", [email, hashedPassword]);

        res.status(201).json(newUser.rows[0]);

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

export default {
    handleLogin,
    handleRegister
};