import express from "express";
import { uploadVideo, getVideos, deleteVideo } from "../controllers/videoController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { uploadVideoMiddleware } from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", verifyJWT, (req, res, next) => {
    uploadVideoMiddleware(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, uploadVideo);
router.get("/list", verifyJWT, getVideos);
router.delete("/:videoId", verifyJWT, deleteVideo);

export default router;
