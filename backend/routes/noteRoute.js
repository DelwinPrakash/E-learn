import express from "express";
import { uploadNote, getNotes, deleteNote } from "../controllers/noteController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { uploadNoteMiddleware } from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", verifyJWT, (req, res, next) => {
    uploadNoteMiddleware(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, uploadNote);
router.get("/list", verifyJWT, getNotes);
router.delete("/:noteId", verifyJWT, deleteNote);

export default router;
