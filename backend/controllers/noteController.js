import Note from "../models/Note.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { generateFlashcardsCore } from "./flashcardGeneratorController.js";

const uploadNote = async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        const author_id = req.user.user_id;
        const userRole = req.user.role;

        if (userRole !== 'teacher' && userRole !== 'admin') {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(403).json({ message: "Unauthorized. Only teachers can upload notes." });
        }

        if (!title || !subject) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ message: "Missing required fields: title and subject" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        // Build a relative URL path (forward slashes for HTTP)
        const url = req.file.path.replace(/\\/g, "/");

        const newNote = await Note.create({
            title,
            description,
            url,
            subject,
            author_id
        });

        // Optional: Auto-generate flashcards if requested
        if (req.body.generateFlashcards === 'true' || req.body.generateFlashcards === true) {
            // Trigger background generation (don't await if you want it to be async, 
            // but for now let's keep it simple or use a background worker if available)
            // Here we'll await or just let it run if we don't want to block the response
            generateFlashcardsCore(newNote.note_id).catch(err => {
                console.error("Auto-generation of flashcards failed:", err);
            });
        }

        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error uploading note:", error);
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ message: "Server Error" });
    }
};

const getNotes = async (req, res) => {
    try {
        const { subject } = req.query;
        const whereClause = subject ? { subject } : {};

        const notes = await Note.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ["name"]
            }],
            order: [["created_at", "DESC"]]
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.user_id;

        const note = await Note.findByPk(noteId);
        if (!note) return res.status(404).json({ message: "Note not found" });

        if (userRole === 'admin' || (userRole === 'teacher' && note.author_id === userId)) {
            // Delete file from disk
            if (note.url) {
                fs.unlink(path.resolve(note.url), (err) => {
                    if (err) console.warn("Could not delete note file:", err.message);
                });
            }
            await Note.destroy({ where: { note_id: noteId } });
            return res.status(200).json({ message: "Note deleted" });
        }

        return res.status(403).json({ message: "Unauthorized" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { uploadNote, getNotes, deleteNote };
