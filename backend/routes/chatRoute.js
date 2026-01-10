import express from "express";
import { chatWithAI, getChatHistory } from "../controllers/chatController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/", verifyJWT, chatWithAI);
router.get("/history", verifyJWT, getChatHistory);

export default router;
