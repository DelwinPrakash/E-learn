import jwt from 'jsonwebtoken';
import UserAuth from '../models/UserAuth.js';
import bcrypt from 'bcrypt';

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if(!token) return res.status(400).json({"message": "Invalid or missing token"});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserAuth.findByPk(decoded.userID);

        if(!user) return res.status(400).json({"message": "User not found"});

        if(user.email_verified) return res.status(400).json({verified: true, "message": "Email already verified"});

        user.email_verified = true;
        await user.save();

        return res.json({token, verified: true, "message": "Email verified successfully"});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

const verifyEmailForPasswordReset = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    if(!token) return res.status(400).json({"message": "Invalid or missing token"});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserAuth.findOne({ where: { email: decoded.email }});

        if(!user) return res.status(400).json({"message": "User not found"});

        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password_hash = hashedPassword;
        await user.save();

        return res.json({"message": "Password changed successfully"});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Error while changing the password, try again later!"});
    }
}

export {
    verifyEmail,
    verifyEmailForPasswordReset
};