import express from "express";
import { generateFlashcardsFromNote } from "../controllers/flashcardGeneratorController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/generate/:noteId", verifyJWT, generateFlashcardsFromNote);

export default router;
