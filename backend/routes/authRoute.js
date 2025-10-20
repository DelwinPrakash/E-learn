import express from "express";
import { handleLogin, handleRegister, handleLogout } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/signup", handleRegister);
router.post("/logout", handleLogout);

export default router;