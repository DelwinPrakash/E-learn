import Video from "../models/Video.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

const uploadVideo = async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        const author_id = req.user.user_id;
        const userRole = req.user.role;

        if (userRole !== 'teacher' && userRole !== 'admin') {
            // Remove uploaded file if unauthorized
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(403).json({ message: "Unauthorized. Only teachers can upload videos." });
        }

        if (!title || !subject) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ message: "Missing required fields: title and subject" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        // Build a relative URL path (forward slashes for HTTP)
        const url = req.file.path.replace(/\\/g, "/");

        const newVideo = await Video.create({
            title,
            description,
            url,
            subject,
            author_id
        });

        res.status(201).json(newVideo);
    } catch (error) {
        console.error("Error uploading video:", error);
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ message: "Server Error" });
    }
};

const getVideos = async (req, res) => {
    try {
        const { subject } = req.query;
        const whereClause = subject ? { subject } : {};

        const videos = await Video.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ["name"]
            }],
            order: [["created_at", "DESC"]]
        });

        res.status(200).json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.user_id;

        const video = await Video.findByPk(videoId);
        if (!video) return res.status(404).json({ message: "Video not found" });

        if (userRole === 'admin' || (userRole === 'teacher' && video.author_id === userId)) {
            // Delete file from disk
            if (video.url) {
                fs.unlink(path.resolve(video.url), (err) => {
                    if (err) console.warn("Could not delete video file:", err.message);
                });
            }
            await Video.destroy({ where: { video_id: videoId } });
            return res.status(200).json({ message: "Video deleted" });
        }

        return res.status(403).json({ message: "Unauthorized" });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { uploadVideo, getVideos, deleteVideo };
