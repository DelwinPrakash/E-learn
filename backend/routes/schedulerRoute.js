import express from "express";
import multer from "multer";
import { generateSchedule } from "../controllers/schedulerController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

// Memory storage for multer since we just pass the buffer to pdf-parse
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

router.post("/generate", verifyJWT, upload.single('syllabus'), generateSchedule);

export default router;
