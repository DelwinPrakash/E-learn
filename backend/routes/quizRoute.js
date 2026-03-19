import express from "express";
import { getTopics, getQuestions, singlePlayerResult } from "../controllers/quizController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/topics", getTopics);
router.get("/questions", verifyJWT, getQuestions);
router.post("/single-player-result", verifyJWT, singlePlayerResult);

export default router;
