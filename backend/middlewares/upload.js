import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const notesDir = "uploads/notes";
fs.mkdirSync(notesDir, { recursive: true });

// Notes / PDF storage
const noteStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, notesDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const noteFileFilter = (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

export const uploadNoteMiddleware = multer({
    storage: noteStorage,
    fileFilter: noteFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}).single("pdf");
