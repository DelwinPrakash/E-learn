import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import chatRoute from "./chatRoute.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/chat", chatRoute);

export default router;