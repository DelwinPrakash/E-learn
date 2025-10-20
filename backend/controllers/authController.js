import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sequelize } from "../config/db.js";
import User from "../models/User.js";
import UserAuth from "../models/UserAuth.js";
import UserSession from "../models/UserSession.js";

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try{  
        const existingUser = await UserAuth.findOne({ where: { email } });
        
        if(!existingUser) return res.status(401).json({"message": "User not found! sign up instead"});
        
        const user = existingUser.dataValues;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if(!passwordMatch) return res.status(401).json({"message": "Invalid credentials!"});

        const newSession = await UserSession.create({ user_id: user.user_id },{
            returning: true,
            raw: true
        });

        const token = jwt.sign({
            userID: user.user_id,
            email: user.email,
            session: newSession.session_id
        },  process.env.JWT_SECRET,{
            expiresIn: "1h"
        });

        return res.json({
            newSession: newSession,
            token
        });

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

const handleRegister = async (req, res) => {
    const { name, email, password } = req.body;

    const t = await sequelize.transaction();

    try{
        const duplicateUser = await UserAuth.findOne({where: { email }});

        if(duplicateUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserAuth.create({
            email,
            password_hash: hashedPassword
        },{
            transaction: t,
            returning: true 
        });

        await UserSession.create({
            user_id: newUser.user_id
        },{
            transaction: t
        });

        await User.create({
            user_id: newUser.user_id,
            name,
            role: "student" 
        },{
            transaction: t
        });

        await t.commit();

        const verificationToken = jwt.sign({
            userID: newUser.user_id,
            email: newUser.email
        },  process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

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
                        <a href="${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}" style="
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

        res.status(201).json({"message": "User registered successfully! Please verify your email to activate your account.", user: newUser});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error, " + error.message});
    }
}

const handleLogout = async (req, res) => {
    const { session_id: sessionID } = req.body;

    try{
        const deleteSession = await UserSession.destroy({ where: { session_id: sessionID }});

        if(deleteSession === 0) return res.status(400).json({"message": "Invalid session ID"});

        return res.json({"message": "Logged out successfully"});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

export {
    handleLogin,
    handleRegister,
    handleLogout
};