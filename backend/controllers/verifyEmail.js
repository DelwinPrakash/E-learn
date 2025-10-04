import jwt from 'jsonwebtoken';
import UserAuth from '../models/UserAuth.js';

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if(!token) return res.status(400).json({"message": "Invalid or missing token"});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserAuth.findByPk(decoded.userID);

        if(!user) return res.status(400).json({"message": "User not found"});

        if(user.email_verified) return res.status(400).json({"message": "Email already verified"});

        user.email_verified = true;
        await user.save();

        return res.json({"message": "Email verified successfully"});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({"message": "Server side error"});
    }
}

export default verifyEmail;