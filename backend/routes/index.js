import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import chatRoute from "./chatRoute.js";
import videoRoute from "./videoRoute.js";
import schedulerRoute from "./schedulerRoute.js";
import noteRoute from "./noteRoute.js";
import flashcardGeneratorRoute from "./flashcardGeneratorRoute.js";
import quizRoute from "./quizRoute.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/chat", chatRoute);
router.use("/user", userRoute);
router.use("/video", videoRoute);
router.use("/scheduler", schedulerRoute);
router.use("/note", noteRoute);
router.use("/flashcards-gen", flashcardGeneratorRoute);
router.use("/quiz", quizRoute);

export default router;