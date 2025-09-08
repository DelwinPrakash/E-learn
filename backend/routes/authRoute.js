import express from "express";
import { handleLogin, handleRegister } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/signup", handleRegister);

export default router;