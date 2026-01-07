import express from "express";
import { verifyEmail, verifyEmailForPasswordReset } from "../controllers/verifyEmail.js";
import { recoverPassword } from "../controllers/authController.js";
import { discussionCard, createThread, addReply, getReplies, deleteThread, deleteReply } from "../controllers/userController.js";

const router = express.Router();

// Auth Routes
router.get("/verify-email", verifyEmail);
router.post("/reset-password", recoverPassword);
router.post("/verify-email-for-password-reset", verifyEmailForPasswordReset);

// Discussion Forum Routes
router.get("/discussion", discussionCard);
router.post("/discussion/create", createThread);
router.get("/discussion/:threadId/replies", getReplies);
router.post("/discussion/reply", addReply);
router.delete("/discussion/:threadId", deleteThread);
router.delete("/discussion/reply/:replyId", deleteReply);

router.get("/flashcards/decks", verifyJWT, getDecks);
router.get("/flashcards/decks/:deckId/cards", verifyJWT, getDeckCards);

export default router;