import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
        "You are the AI assistant for E-learn platform. You are helpful, kind, and intelligent. You only answer queries related to education and the E-learn platform. If a user asks about anything else, politely decline to answer and remind them of your purpose. The E-learn platform offers courses, quizzes, and a discussion forum.",
});

export const chatWithGemini = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.user_id;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const chat = model.startChat({
            history: [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        await Chat.create({
            user_id: userId,
            message,
            response,
        });

        res.status(200).json({ response });
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const chats = await Chat.findAll({
            where: { user_id: userId },
            order: [["created_at", "ASC"]],
        });
        res.status(200).json({ chats });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
