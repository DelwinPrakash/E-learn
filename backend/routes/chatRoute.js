import express from "express";
import { chatWithGemini, getChatHistory } from "../controllers/chatController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/", verifyJWT, chatWithGemini);
router.get("/history", getChatHistory);

export default router;
