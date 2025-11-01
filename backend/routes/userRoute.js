import express from "express";
import { verifyEmail, verifyEmailForPasswordReset } from "../controllers/verifyEmail.js";
import { recoverPassword } from "../controllers/authController.js";

const router = express.Router();

router.get("/verify-email", verifyEmail);
router.post("/reset-password", recoverPassword);
router.post("/verify-email-for-password-reset", verifyEmailForPasswordReset);

export default router;