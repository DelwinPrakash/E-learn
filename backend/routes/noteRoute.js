import express from "express";
import { uploadNote, getNotes, deleteNote } from "../controllers/noteController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/upload", verifyJWT, uploadNote);
router.get("/list", verifyJWT, getNotes);
router.delete("/:noteId", verifyJWT, deleteNote);

export default router;
