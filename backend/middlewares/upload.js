import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const videosDir = "uploads/videos";
const notesDir = "uploads/notes";
fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(notesDir, { recursive: true });

// Video storage
const videoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, videosDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

// Notes / PDF storage
const noteStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, notesDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const videoFileFilter = (_req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only video files (mp4, webm, ogg, mov) are allowed"), false);
    }
};

const noteFileFilter = (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

export const uploadVideoMiddleware = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
}).single("video");

export const uploadNoteMiddleware = multer({
    storage: noteStorage,
    fileFilter: noteFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}).single("pdf");
