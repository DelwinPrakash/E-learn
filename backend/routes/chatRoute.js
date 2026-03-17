import express from "express";
import { chatWithAI, getChatHistory, summarizeText } from "../controllers/chatController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/", verifyJWT, chatWithAI);
router.get("/history", verifyJWT, getChatHistory);
router.post("/summarize", verifyJWT, summarizeText);

export default router;
