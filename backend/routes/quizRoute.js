import express from "express";
import { getTopics, getQuestions, singlePlayerResult, createQuiz, generateQuizFromAI } from "../controllers/quizController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/topics", getTopics);
router.get("/questions", verifyJWT, getQuestions);
router.post("/single-player-result", verifyJWT, singlePlayerResult);
router.post("/create", verifyJWT, createQuiz);
router.post("/generate-ai", verifyJWT, generateQuizFromAI);

export default router;
