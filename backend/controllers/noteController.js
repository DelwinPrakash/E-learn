import Note from "../models/Note.js";
import User from "../models/User.js";

const uploadNote = async (req, res) => {
    try {
        const { title, description, url, subject } = req.body;
        const author_id = req.user.user_id;
        const userRole = req.user.role;

        if (userRole !== 'teacher' && userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized. Only teachers can upload notes." });
        }

        if (!title || !url || !subject) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newNote = await Note.create({
            title,
            description,
            url,
            subject,
            author_id
        });

        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error uploading note:", error);
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
