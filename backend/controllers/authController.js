import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

        const verificationToken = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});

        const newUser = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email", [email, hashedPassword]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: 'Email Verification - E-Learn',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Verification</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333; text-align: center; font-size: 24px; margin-bottom: 20px;">
                            Verify Your Email Address
                        </h1>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">Hi ${email},</p>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            Thank you for signing up! To complete your registration, please verify your email address by clicking the button below.
                        </p>
                        <a href="http://localhost:5173/verify-email?token=${verificationToken}" style="
                            display: inline-block; 
                            padding: 10px 20px; 
                            background-color: #4CAF50; 
                            color: #fff; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            text-align: center; 
                            font-size: 16px; 
                            margin: 20px 0;">
                            Verify My Email
                        </a>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            If you didn't sign up for this account, you can safely ignore this email.
                        </p>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            Best regards, <br>
                            E-LEARN
                        </p>
                    </body>
                </html>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.error("Error sending email:", error);
                return res.status(500).json({"message": `Error sending verification email, ${error.message}`});
            }
        });

        res.status(201).json({"message": "User registered successfully! Please verify your email to activate your account.", user: newUser.rows[0]});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error" + error.message});
    }
}

export {
    handleLogin,
    handleRegister
};